import {Component} from 'react'
import Cookies from 'js-cookie'
import {Redirect} from 'react-router-dom'
import {
  MainContainer,
  LoginForm,
  WebsiteLogo,
  Label,
  InputEl,
  Container,
  LoginButton,
  ErrorMsg,
  InputCheckBox,
  LineBreak,
} from './styledComponent'

class Login extends Component {
  state = {
    username: '',
    password: '',
    showError: false,
    errorMsg: '',
    showPassword: false,
  }

  onChangeUsername = event => {
    this.setState({username: event.target.value})
  }

  onChangePassword = event => {
    this.setState({password: event.target.value})
  }

  onChangeCheckBox = () => {}

  onFormSubmit = async event => {
    event.preventDefault()
    let {username, password} = this.state
    if (username.toLowerCase().trim(' ') === 'venky') username = 'rahul'
    if (password === 'venky@2004') password = 'rahul@2021'
    const userData = {
      username,
      password,
    }
    const url = 'https://apis.ccbp.in/login'
    const options = {
      method: 'POST',
      body: JSON.stringify(userData),
    }
    const response = await fetch(url, options)
    const responseData = await response.json()
    if (response.ok === true) {
      this.onSubmitSuccess(responseData.jwt_token)
    } else {
      this.onSubmitFailure(responseData.error_msg)
    }
  }

  onSubmitSuccess = jwtToken => {
    Cookies.set('jwt_token', jwtToken, {expires: 1})
    const {history} = this.props
    history.replace('/')
  }

  onSubmitFailure = errorMsg => {
    this.setState({showError: true, errorMsg})
  }

  onChangeCheckBox = event => {
    this.setState({showPassword: event.target.checked})
  }

  render() {
    const jwtToken = Cookies.get('jwt_token')
    if (jwtToken !== undefined) {
      return <Redirect to="/" />
    }
    const {username, password, showError, errorMsg, showPassword} = this.state
    return (
      <MainContainer className="bg-container" data-testid="login">
        <LoginForm className="login-form" onSubmit={this.onFormSubmit}>
          <WebsiteLogo
            className="website-logo"
            src="https://assets.ccbp.in/frontend/react-js/nxt-watch-logo-light-theme-img.png"
            alt="website logo"
          />
          <Container>
            <Label className="label" htmlFor="username">
              USERNAME
            </Label>
            <LineBreak />
            <InputEl
              id="username"
              value={username}
              type="text"
              placeholder="venky"
              className="input"
              onChange={this.onChangeUsername}
            />
          </Container>
          <Container>
            <Label htmlFor="password">PASSWORD</Label>
            <LineBreak />
            <InputEl
              id="password"
              value={password}
              type={showPassword ? 'text' : 'password'}
              placeholder="venky@2004"
              onChange={this.onChangePassword}
            />
          </Container>
          <Container>
            <InputCheckBox
              id="show-password"
              type="checkbox"
              value={password}
              onChange={this.onChangeCheckBox}
            />
            <Label htmlFor="show-password">Show Password</Label>
          </Container>
          <LoginButton type="submit" className="submit-button">
            Login
          </LoginButton>
          {showError && <ErrorMsg className="error-msg">*{errorMsg}</ErrorMsg>}
        </LoginForm>
      </MainContainer>
    )
  }
}

export default Login
