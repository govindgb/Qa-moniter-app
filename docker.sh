source .env

build(){
    echo "Building image...."
    docker build . -t ${IMAGE_NAME}:latest
}

if [ "$1" == "-build" ]
then
    if docker images -a | grep -q ${IMAGE_NAME}
    then 
        echo "Image already exist...."
        echo "Removing image...."
        build
    else
        build
    fi
elif [ "$1" == "-up" ]
then
    if docker ps | grep -q ${IMAGE_NAME}-container
    then 
        echo "Container already running!"
    else
        docker-compose up -d
        docker logs -f ${IMAGE_NAME}-container
    fi
elif [ "$1" == "-down" ]
then
    if docker ps | grep -q ${IMAGE_NAME}-container
    then 
        echo "Stopping container!"
        docker stop ${IMAGE_NAME}-container
         echo "Removing container!"
        docker rm ${IMAGE_NAME}-container
    else
        echo "Container does not exist!"
    fi
elif [ "$1" == "-push" ]
then
    if docker images -a | grep -q ${IMAGE_NAME}
    then
        echo "Taging Image..."
        docker tag ${IMAGE_NAME}:latest ${DOCKER_CONTAINER_NAME}/${IMAGE_NAME}:${TAG} #Use ${AWS_ECR_URL} from ${DOCKER_CONTAINER_NAME} to switch to Docker Private Registry
        echo "Pushing Image to DOCKER HUB..."
        docker push ${DOCKER_CONTAINER_NAME}/${IMAGE_NAME}:${TAG} #Use ${AWS_ECR_URL} from ${DOCKER_CONTAINER_NAME} to switch to Docker Private Registry
        echo "Image successfully published to docker cloud registry."
        docker image rm ${DOCKER_CONTAINER_NAME}/${IMAGE_NAME}:${TAG} #Use ${AWS_ECR_URL} from ${DOCKER_CONTAINER_NAME} to switch to Docker Private Registry
        #echo "Cleanup: removed local container with tag ${TAG}"
    fi
fi