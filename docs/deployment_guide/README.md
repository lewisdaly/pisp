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
helm upgrade --install --namespace pisp-test mojaloop mojaloop/mojaloop --version v11.0.0 -f ./config/values_mojaloop.yaml

# install an ingress controller
helm --namespace pisp-test install ingress ingress-nginx/ingress-nginx
kubectl get service/ingress-ingress-nginx-controller

# For AWS based hosts:
# output is: something like
# ab7419cf221a94fdaa5ec1883f08e95e-639283179.eu-west-2.elb.amazonaws.com
export ELB_URL=<your ingress url>

# for microk8s, use metallb to assign a local IP
# microk8s enable metallb:192.168.0.90-192.168.0.95  
# export ELB_URL=192.168.0.90
curl -H "Host: ml-api-adapter.local" $ELB_URL/health
curl -H "Host: central-ledger.dev" $ELB_URL/health

# for microk8s, create your own storage class
# kubectl apply -f ./config/storage_class_microk8s.yaml

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

# For microk8s, you will get a new IP from metalLB
# export ELB_URL=192.168.0.91

# set up our own ingresses
kubectl apply -f ./config/ingress_kong_thirdparty.yaml
kubectl apply -f ./config/ingress_kong_fspiop.yaml
kubectl apply -f ./config/ingress_kong_admin.yaml

# test the endpoints are exposed correctly 
# (these should throw errors, since GET isn't allowed, and we're not passing
# in any headers
curl $ELB_URL/api/fspiop/participants
curl $ELB_URL/api/fspiop/parties
curl $ELB_URL/api/fspiop/transactionRequests
curl $ELB_URL/api/fspiop/authorizations
curl $ELB_URL/api/fspiop/quotes
curl $ELB_URL/api/fspiop/transfers

curl $ELB_URL/api/thirdparty/consents
curl $ELB_URL/api/thirdparty/consentRequests
curl $ELB_URL/api/thirdparty/thirdpartyRequests/transactions/
curl $ELB_URL/api/thirdparty/authorizations

# health checks - these should all pass
curl $ELB_URL/api/admin/central-ledger/health
curl $ELB_URL/api/admin/account-lookup-service/health
curl $ELB_URL/api/admin/account-lookup-service-admin/health
curl $ELB_URL/api/admin/ml-api-adapter/health
curl $ELB_URL/api/admin/thirdparty-api-adapter/health
curl $ELB_URL/api/admin/auth-service/health
curl $ELB_URL/api/admin/oracle-consent/health
curl $ELB_URL/api/admin/oracle-simulator/health
curl $ELB_URL/api/admin/thirdparty-tx-requests-service/health
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
kubectl apply -f ./config/ingress_simulators.yaml
kubectl apply -f ./config/ingress_ttk.yaml


# now we can test the ingresses:
curl $ELB_URL/dfspa/simulator/repository/parties
curl $ELB_URL/dfspa/sdk-scheme-adapter/health
curl $ELB_URL/dfspa/thirdparty-scheme-adapter/health
...

# for the ttk instances, we need to (sadly) configure out /etc/hosts - for example
# mojaloop hacks
## 192.168.0.91	pig-ttk.alpha.moja-lab.live dog-ttk.alpha.moja-lab.live

curl pig-ttk.alpha.moja-lab.live
curl dog-ttk.alpha.moja-lab.live
```

## Configuring 

Now we will use `ml-boostrap` to set up our switch and simulators from scratch.

Edit the config file in `./config/ml-bootstrap.json5` and set (based on your `$ELB_URL` variable)
- `urls.fspiop`
- `urls.alsAdmin`
- `urls.alsAdmin`
- `applicationUrls.oracle`

```bash
cd $BASE_DIR/ml-bootstrap
npm run ml-bootstrap -- hub -c $BASE_DIR/pisp/docs/deployment_guide/config/ml-bootstrap.json5

# bootstrap only the participants
npm run ml-bootstrap -- participants -c $BASE_DIR/pisp/docs/deployment_guide/config/ml-bootstrap.json5

# bootstrap only the parties (end users)
npm run ml-bootstrap -- parties -c $BASE_DIR/pisp/docs/deployment_guide/config/ml-bootstrap.json5


# check that the parties have been registered at the simulators:
curl $ELB_URL/dfspa/simulator/repository/parties
```

## Testing a P2P Transfer

Now we can use the TTK to test a simple P2P transfer.

Go to `http://dog-ttk.alpha.moja-lab.live/admin/outbound_request` in your browser, and load the sample 

(Follow [this guide](http://beta.moja-lab.live/3-guides/5_ttk_p2p.html)) and make the following changes:

- `toIdValue`: `123456789`
- `fromFspId`: `dog`
- `toFspId`: `dfspa`
- `payerfsp`: `dog`

If everything passes, then you know that the configuration is up and running ok!

## Testing the `CONSENT` Oracle



## TODO:

- Update ml-bootstrap to allow configuring multiple oracles
- Deploy the pisp demo server and get the Android app running

## Known Issues:

- duplicate transaction-requests-service
- using Kong API Gateway
    - routing rules for `/thirdpartyRequests/...` are likely to be wrong
- Doesn't the auth-service need a database?

### Non deterministic settlement accounts:

When boostrapping the DFSPs, if you see the following error:

```
    - Error: Status: 500 Message: {"errorInformation":{"errorCode":"2001","errorDescription":"Internal server error - The account does not match participant or currency specified"}}
```

This likely means that the `settlementAccountId` for the DFSP needs tweaking. ml-boostrap isn't currently smart enough to figure out the 
`settlementAccountId` for you, so you have to do the following:

1. Register the DFSP - and expect a failure
2. Look up the DFSP's accounts with the following:
```bash
curl -s $ELB_URL/api/admin/central-ledger/participants/dfspa | jq 
``` 
3. Enter the correct value for the `settlementAccountId` in your `ml-boostrap.json5` file
4. Re-run `ml-boostrap` (dfsps only)
```bash
npm run ml-bootstrap -- participants -c $BASE_DIR/pisp/docs/deployment_guide/config/ml-bootstrap.json5
```