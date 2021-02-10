# Deployment Guide

This guide details how you can deploy Mojaloop and the PISP functionality.
It's a heavy work in progress, so not all steps will work for your cluster.
## Prerequisuites

- `helm`, `kubectl`, `kubens`
- Access to a running k8s cluster, and a valid `.kubeconfig` file
- Configured storage drivers
- Cloned the following repos:
```bash
# change basedir to wherever you will work
export BASE_DIR="/home/lew/developer/mojaloop"
cd $BASE_DIR
# todo: proper urls with branches etc
git clone pisp
git clone ml-seeder
git clone -b feat/initial-pisp-charts git@github.com:vessels-tech/helm.git

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
# values_mojaloop.yaml specifies some special versions for 
# pisp to run with (central-ledger, account-lookup-service)
helm upgrade --install --namespace pisp-test mojaloop mojaloop/mojaloop -f ./values_mojaloop.yaml

# install an ingress controller
helm --namespace pisp-test install ingress ingress-nginx/ingress-nginx
kubectl get service/ingress-ingress-nginx-controller

# output is: something like
# ab7419cf221a94fdaa5ec1883f08e95e-639283179.eu-west-2.elb.amazonaws.com
export ELB_URL=<your ingress url>

curl -H "Host: account-lookup-service.dev" $ELB_URL/health
curl -H "Host: ml-api-adapter.dev" $ELB_URL/health
curl -H "Host: central-ledger.dev" $ELB_URL/health


# install the thirdparty charts
kubectl apply -f $BASE_DIR/helm/thirdparty/thirdparty_base_oracle.yaml
helm upgrade --install thirdparty $BASE_DIR/helm/thirdparty -f $BASE_DIR/helm/thirdparty/values.yaml
```

## Installing and configuring the API Gateway

```bash
helm repo add kong https://charts.konghq.com
helm repo update
# helm install kong kong/kong --set ingressController.installCRDs=false

# install kong with custom config
helm upgrade --install --namespace pisp-test pisp-test-kong kong/kong -f ./kong_values.yaml

# set up our own ingresses
kubectl apply -f ./ingress_kong_thirdparty.yaml
kubectl apply -f ./ingress_kong_fspiop.yaml
kubectl apply -f ./ingress_kong_admin.yaml

# test the endpoints are exposed correctly 
# (these should throw errors, since GET isn't allowed, and we're not passing
# in any headers
curl beta.moja-lab.live/pisp-test/api/fspiop/participants
curl beta.moja-lab.live/pisp-test/api/fspiop/parties
curl beta.moja-lab.live/pisp-test/api/fspiop/transactionRequests
curl beta.moja-lab.live/pisp-test/api/fspiop/authorizations
curl beta.moja-lab.live/pisp-test/api/fspiop/quotes
curl beta.moja-lab.live/pisp-test/api/fspiop/transfers

curl beta.moja-lab.live/pisp-test/api/thirdparty/consents
curl beta.moja-lab.live/pisp-test/api/thirdparty/consentRequests
curl beta.moja-lab.live/pisp-test/api/thirdparty/thirdpartyRequests/transactions/
curl beta.moja-lab.live/pisp-test/api/thirdparty/authorizations


# health checks
curl beta.moja-lab.live/pisp-test/api/admin/central-ledger/health
curl beta.moja-lab.live/pisp-test/api/admin/account-lookup-service/health
curl beta.moja-lab.live/pisp-test/api/admin/account-lookup-service-admin/health
curl beta.moja-lab.live/pisp-test/api/admin/ml-api-adapter/health
curl beta.moja-lab.live/pisp-test/api/admin/thirdparty-api-adapter/health
curl beta.moja-lab.live/pisp-test/api/admin/auth-service/health
curl beta.moja-lab.live/pisp-test/api/admin/oracle-consent/health
curl beta.moja-lab.live/pisp-test/api/admin/thirdparty-tx-requests-service/health
```



## Installing PISP + DFSP Simulators

## Configuring 


## Known Issues:

- duplicate transaction-requests-service
- using Kong API Gateway
    - routing rules for `/thirdpartyRequests/...` are likely to be wrong
- Doesn't the auth-service need a database?
