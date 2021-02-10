# Deployment Guide

This guide details how you can deploy Mojaloop and the PISP functionality.
It's a heavy work in progress, 
## Prerequisuites

- `helm`, `kubectl`, `kubens`
- Access to a running k8s cluster, and a valid `.kubeconfig` file
- Configured storage drivers
- Cloned the following repos:
```bash
# todo: proper urls with branches etc
git clone pisp
git clone ml-seeder
git clone helm...
```
## Installing Core Mojaloop + Thirdparty


```bash
# first, create a namespace for us to work in
kubectl create namespace pisp-test
kubens pisp-test

# add helm repos and install mojaloop
helm repo add mojaloop http://mojaloop.io/helm/repo/
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
helm repo add kiwigrid https://kiwigrid.github.io
helm repo add elastic https://helm.elastic.co
helm repo add bitnami https://charts.bitnami.com/bitnami


helm upgrade --install  --namespace ml-app mojaloop mojaloop/mojaloop  -f ./config/values_mojaloop.yaml --wait --timeout 15m

helm --namespace kube-public install ingress ingress-nginx/ingress-nginx
kubens kube-public
kubectl get service/ingress-ingress-nginx-controller

ab7419cf221a94fdaa5ec1883f08e95e-639283179.eu-west-2.elb.amazonaws.com
```

6. health checks

```bash
curl -H "Host: account-lookup-service.local" ab7419cf221a94fdaa5ec1883f08e95e-639283179.eu-west-2.elb.amazonaws.com/health
curl -H "Host: ml-api-adapter.local" ab7419cf221a94fdaa5ec1883f08e95e-639283179.eu-west-2.elb.amazonaws.com/health
curl -H "Host: central-ledger.local" ab7419cf221a94fdaa5ec1883f08e95e-639283179.eu-west-2.elb.amazonaws.com/health
```


```

## Installing PISP + DFSP Simulators

## Configuring 