//
// Lockpage page component
//
import React from 'react'

import Head from 'next/head'

import { styled } from '../../../../stitches.config'
import Lockbox from '../../components/Lockbox'

const keyName = 'theKey'

class Lockpage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      inputValue: '',
      placeholder: 'enter here',
    }
    
    this.handleUnlock = this.handleUnlock.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleUnlock(httpClient, inputValue) {
    return (event) => {
      event.preventDefault()
      const bodyData = {}
      bodyData[keyName] = inputValue
      httpClient
        .post('/unlock')
        .set('Content-Type', 'application/json')
        .send(`{"${keyName}":"${inputValue}"}`)
        .then(() => {
          // Navigate to root on success response
          window.location.replace('../')
        })
        .catch(() => {
          this.setState({
            inputValue: '',
            placeholder: 'nope',
          })
        })
    }
  }

  handleChange(event) {
    this.setState({
      inputValue: event.target.value,
    })
  }

  render() {
    return (
      <LockpageContainer>
        <Head>
          <title>enter</title>
        </Head>
        <Main>
          <Lockbox
            submitHandler={this.handleUnlock}
            httpClient={this.props.httpClient}
            inputValue={this.state.inputValue}
            changeHandler={this.handleChange}
            placeholder={this.state.placeholder}
          />
        </Main>
      </LockpageContainer>
    )
  }
}

const LockpageContainer = styled('div', {
  backgroundColor: '#ffffff',
})

const Main = styled('main', {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  minHeight: '90vh',
  minWidth: '100vw',

  '@sm': { minHeight: '100vh' },
})

export default Lockpage
