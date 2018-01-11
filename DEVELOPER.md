## Dev environment setup

**Prerequisites:** Install Node>=7, Docker ToolBox for Mac,
docker (>=1.12.5)

**Docker image setup:**

Make sure you can access [docker hub](https://hub.docker.com). Run the below command on all the hosts to pull the image

        docker pull autometer/jmeter-base:latest 

**Repo setup and deployment:**

Clone the repository, cd to cloned-dir/autometer.
To deploy the module globally run the below command.

        npm run deploy

**Test execution:**

Follow the steps in sequence

        cd autometer/examples
        
* Make sure host in the autometer.config.js is set correctly 
* Make sure docker port is set correctly, default 2375 if you have custom port set DOCKER_PORT env

        autometer --startTest
      
**Screenshots:**       
 
<img width=600px src="/docs/deploy.png">
<img width=600px src="/docs/help.png">
<img width=600px src="/docs/start.png">
<img width=600px src="/docs/stop.png">
<img width=600px src="/docs/autometer-log.png">
