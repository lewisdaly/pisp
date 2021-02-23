/* eslint-disable import/no-named-as-default-member */
import TestEnv from './TestEnv'
import axios from 'axios'
import expected from './expected'
import { v4 } from 'uuid'
// import { inspect } from 'util'

// pisp transfer from Alice -> Bob
describe('/thirdpartyTransaction: partyLookup->initiate->approve', (): void => {
  const transactionRequestId = v4()
  jest.setTimeout(10000)
  it.only('transactionRequestState should be ACCEPTED', async (): Promise<void> => {
    // LOOKUP PHASE
    // lookup for Bob
    const lookupRequest = {
      payee: {
        partyIdType: TestEnv.users.bob.idType,
        partyIdentifier: TestEnv.users.bob.idValue
      },
      transactionRequestId: transactionRequestId
    }
    const lookupURI = `${TestEnv.baseUrls.pispThirdpartySchemeAdapterOutbound}/thirdpartyTransaction/partyLookup`
    const lookupResponse = await axios.post(lookupURI, lookupRequest)
    console.log('lookupResponse is', lookupResponse)

    expect(lookupResponse.status).toEqual(200)
    expect(lookupResponse.data.currentState).toEqual('partyLookupSuccess')
    expect(lookupResponse.data.party).toEqual(expected.Bob)

    // // INITIATE PHASE
    // const initiateURI = `${TestEnv.baseUrls.pispThirdpartySchemeAdapterOutbound}/thirdpartyTransaction/${transactionRequestId}/initiate`
    // const initiateRequest = {
    //   sourceAccountId: 'dfspa.alice.1234',
    //   consentId: '8e34f91d-d078-4077-8263-2c047876fcf6',
    //   payee: {
    //     partyIdInfo: { ...expected.Bob.partyIdInfo }
    //   },
    //   payer: {
    //     personalInfo: { ...expected.Alice.personalInfo },
    //     partyIdInfo: { ...expected.Alice.partyIdInfo }
    //   },
    //   amountType: 'SEND',
    //   amount: {
    //     amount: '100',
    //     currency: 'USD'
    //   },
    //   transactionType: {
    //     scenario: 'TRANSFER',
    //     initiator: 'PAYER',
    //     initiatorType: 'CONSUMER'
    //   },
    //   expiration: '2020-07-15T22:17:28.985-01:00'
    // }
    // const initiateResponse = await axios.post(initiateURI, initiateRequest)
    // expect(initiateResponse.status).toEqual(200)
    // expect(initiateResponse.data.currentState).toEqual('authorizationReceived')

    // // APPROVE PHASE
    // const approveURI = `${TestEnv.baseUrls.pispThirdpartySchemeAdapterOutbound}/thirdpartyTransaction/${transactionRequestId}/approve`
    // const approveRequest = {
    //   authorizationResponse: {
    //     authenticationInfo: {
    //       authentication: 'U2F',
    //       authenticationValue: {
    //         pinValue: 'xxxxxxxxxxx',
    //         counter: '1'
    //       }
    //     },
    //     responseType: 'ENTERED'
    //   }
    // }
    // const approveResponse = await axios.post(approveURI, approveRequest)
    // expect(approveResponse.status).toEqual(200)
    // expect(approveResponse.data.currentState).toEqual('transactionStatusReceived')
    // expect(approveResponse.data.transactionStatus.transactionRequestState).toEqual('ACCEPTED')
  })
})
