# Deployment Guide

This guide details how you can deploy Mojaloop and the PISP functionality.
It's a heavy work in progress, so not all steps will work for your cluster.
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
cd docs/deployment_guide

# first, create a namespace for us to work in
kubectl create namespace pisp-test
kubens pisp-test

# add helm repos and install mojaloop
helm repo add mojaloop http://mojaloop.io/helm/repo/
helm repo add public https://charts.helm.sh/incubator
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

# install mojaloop
helm upgrade --install --namespace pisp-test mojaloop mojaloop/mojaloop -f ./values_mojaloop.yaml

# install an ingress controller
helm --namespace pisp-test install ingress ingress-nginx/ingress-nginx
kubectl get service/ingress-ingress-nginx-controller

# output is: something like
# ab7419cf221a94fdaa5ec1883f08e95e-639283179.eu-west-2.elb.amazonaws.com
export ELB_URL=<your ingress url>

curl -H "Host: account-lookup-service.local" $ELB_URL/health
curl -H "Host: ml-api-adapter.local" $ELB_URL/health
curl -H "Host: central-ledger.local" $ELB_URL/health
```

[ todo: kong api gateway? that might make things easier... also the ml-seeder might need it...]


## Installing PISP + DFSP Simulators

## Configuring 