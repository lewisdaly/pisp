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
helm upgrade --install --namespace pisp-test mojaloop mojaloop/mojaloop -f ./config/values_mojaloop.yaml

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

# install kong with custom config
helm upgrade --install --namespace pisp-test pisp-test-kong kong/kong -f ./config/kong_values.yaml

# set up our own ingresses
kubectl apply -f ./config/ingress_kong_thirdparty.yaml
kubectl apply -f ./config/ingress_kong_fspiop.yaml
kubectl apply -f ./config/ingress_kong_admin.yaml

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

# health checks - these should all pass
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

In this step we will set up simulators and ttk instances for:
- `pispa` - a PISP
- `dfspa` a DFSP with PISP enabled (will be the sender)
- `dfspb` a Vanilla DFSP
- `pig` a TTK to act as a PISP
- `dog` a TTK to act as a DFSP

```bash
# install simulators
helm upgrade --install pisp-poc-dfspa $BASE_DIR/helm/thirdparty-simulator -f  $BASE_DIR/helm/thirdparty-simulator/values_dfspa.yml
helm upgrade --install pisp-poc-dfspb $BASE_DIR/helm/thirdparty-simulator -f  $BASE_DIR/helm/thirdparty-simulator/values_dfspb.yml
helm upgrade --install pisp-poc-pispa $BASE_DIR/helm/thirdparty-simulator -f  $BASE_DIR/helm/thirdparty-simulator/values_pispa.yml

# install ttk instances
helm upgrade --install --namespace pisp-test pig-ttk mojaloop/ml-testing-toolkit --values ./config/values-ttk-pig.yaml
helm upgrade --install --namespace pisp-test dog-ttk mojaloop/ml-testing-toolkit --values ./config/values-ttk-dog.yaml

# install ingress for simulators and ttk instances
# TODO
```

## Configuring 

Now we will use `ml-boostrap` to set up our switch and simulators from scratch

```bash

```


## Known Issues:

- duplicate transaction-requests-service
- using Kong API Gateway
    - routing rules for `/thirdpartyRequests/...` are likely to be wrong
- Doesn't the auth-service need a database?
