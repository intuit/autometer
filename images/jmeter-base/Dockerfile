FROM openjdk:8-jdk-alpine

MAINTAINER autometer.npm@gmail.com

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