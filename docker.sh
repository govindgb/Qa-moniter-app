source .env

build(){
    echo "Building image...."
    docker build --platform=linux/amd64 . -t ${IMAGE_NAME}:latest
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
        docker-compose --env-file docker.env -f docker-compose.yml up -d
        # docker logs -f ${IMAGE_NAME}-container
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
        echo "Taging for AWS ECR..."
        docker tag ${IMAGE_NAME}:latest ${AWS_ECR_URL}/${IMAGE_NAME}:${ECR_TAG}
        echo "Pushing container to AWS ECR..."
        docker push ${AWS_ECR_URL}/${IMAGE_NAME}:${ECR_TAG}
        echo "Container successfully published to AWS ECR!"
        docker image rm ${AWS_ECR_URL}/${IMAGE_NAME}:${ECR_TAG}
        echo "Cleanup: removed local container with tag ${ECR_TAG}"
    fi
fi
