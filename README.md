AutoMeter
=========

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![js-standard-style][standard-image]][standard-url]

An automation tool for scaling load tests using distributed slaves. 
Based on master-slave architecture where master acts as a test coordinator, from where tests
are triggered and the actual tests are distributed across multiple hosts. 

Prerequisites
-------------
* One or more linux hosts with [docker (>=1.12.5)](https://docs.docker.com/engine/installation/) installed.
* In one of the linux host install [nodeJs (>=7)](https://nodejs.org/en/download/) and autometer npm module. 
This node can be designated as master (from where tests has to be triggered).

Install
-------
    npm install -g autometer 

Usage
-----
```    
$ autometer --help
    
    Usage: autometer <command>
    
    Options:
    --version    Show version number                                     [boolean]
    --startTest  Start the test
    --stopTest   Stop the running test
    --logs       Display the running test logs
    --clear      Clear the test output files
    -?, --help   Show help                                               [boolean]
    
    Examples:
    autometer --startTest                   Start the test
    autometer --stopTest                    Stop the running test
    autometer --logs                        Tail the running test logs
    autometer --clear                       Remove the generated reports and logs
    export DOCKER_PORT=port                 To set docker port, default port 2376
    DOCKER_PORT=port autometer --startTest  To set docker port and start the test
```

Getting Started
--------------
<img width=700px src="/docs/autometer-diagram.png">


#### Docker images setup:
 * Make sure you can access [docker hub](https://hub.docker.com). 
 Run the below command on all the hosts to pull the image
 
        docker pull autometer/jmeter-base 
 
#### Autometer setup and configuration: 

* Login to the host (designated as master) where node is installed and run the below command

        npm install -g autometer

* Create a folder (say api-test) and following 3 files are needed to run a test

        1. autometer.config.js
        2. test.jmx
        3. global.properties

 1. autometer.config.js - File to configure autometer itself, you can define number of load generators.
 Typical config file is as shown below.
 <br><br> **Caution**: If your running multiple tests, make sure you use different ports, 
 otherwise it results in port conflicts 
 
         const config = {
             testName: 'test.jmx',
             master: {
                 host: 'hostname',
                 resultsPort: 2099
             },
             slaves: [
                 {host: 'hostname', port: 1099, resultsPort: 2099},
                 {host: 'hostname', port: 1199, resultsPort: 2199}
             ]
         };
 
         module.exports = config;
  
2. test.jmx - Your jmeter test file, make sure test name matches with autometer config testName variable.
3. global.properties - externalized test properties

#### Test execution
* Goto folder having 3 files and run below commands
    
        [To start a start]
         
        $ autometer --startTest
        
        [To tail running test logs]
        
        $ autometer --logs
        
        [To stop a running test]
        
        $ autometer --stopTest


FAQs 
=====

**What type of test execution is supported?**
> Only jmx tests is supported 

**How to create custom docker images?**
> Create a Dockerfile, sample file as mentioned below
 ````
 FROM openjdk:8-jdk-alpine
 ENV JMETER_VERSION 3.1
 ENV JMETER_PLUGINS_VERSION=1.4.0
 ENV JMETER_HOME=/usr/local/apache-jmeter-${JMETER_VERSION}
 ENV PATH=${JMETER_HOME}/bin:${PATH}
 
 RUN wget  http://archive.apache.org/dist/jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz && \
   tar xf apache-jmeter-${JMETER_VERSION}.tgz -C /usr/local
 
 RUN wget http://jmeter-plugins.org/downloads/file/JMeterPlugins-Standard-${JMETER_PLUGINS_VERSION}.zip && \
   unzip -o JMeterPlugins-Standard-${JMETER_PLUGINS_VERSION}.zip -d ${JMETER_HOME}
 
 EXPOSE 2099-2999
 
 ENTRYPOINT ["jmeter.sh"]
 ````
> Build the docker image using below command
        
        docker build -t autometer/jmeter-base .
 
> **Note:** 
    <br>1. Expose ports for test communication and report consolidation
    <br>2. docker image tag should be autometer/jmeter-base

**How to run multiple tests from master?**
> You can trigger any number of test runs from master. Create different folders and place the 3 files 
(config js, test file, global properties).Goto any of the test folder and trigger autometer commands. 

**How to configure ports?**

>* Only docker exposed ports can used as "resultsPort" (2099-2999)
>* There is no restriction on the slave primary port, you can change it to any free port
>* By default, stick to 1099 (for the slave primary port) and 2099 for the resultsPort
>* Here is a sample configuration with 1 master and 5 slaves, all on the same linux host !

        const config = {
            testName: 'test.jmx',
            master: {
                host: 'hostname',
                resultsPort: 2099
            },
            slaves: [
                {host: 'hostname', port: 1199, resultsPort: 2199},
                {host: 'hostname', port: 1299, resultsPort: 2299},
                {host: 'hostname', port: 1399, resultsPort: 2399},
                {host: 'hostname', port: 1499, resultsPort: 2499},
                {host: 'hostname', port: 1599, resultsPort: 2599}
            ]
        };

        module.exports = config;

**How to clean up docker containers in case of port conflicts?**

>* Try autometer stopTest command
>* Run the below commands on all the hosts to clean up containers manually
        
        docker stop $(docker ps -aq)
        docker rm $(docker ps -aq)

Contribute
==========
  See [DEVELOPER.md](./DEVELOPER.md) for the instructions
    

Support 
=======

* autometer.npm@gmail.com

[travis-url]: https://travis-ci.org/intuit/autometer
[travis-image]: https://img.shields.io/travis/intuit/autometer/master.svg
[npm-url]: https://www.npmjs.com/package/autometer
[npm-image]: https://img.shields.io/npm/v/autometer.svg
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/
