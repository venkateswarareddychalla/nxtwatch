import {Component} from 'react'
import './index.css'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BiSearchAlt2} from 'react-icons/bi'
import {formatDistanceToNow} from 'date-fns'
import NxtContext from '../../context/context'
import Header from '../Header'
import SideBar from '../SideBar'
import VideoItem from '../VideoItem'

import BuyPremiumView from '../BuyPremiumView'

import {
  MainContainer,
  VideoListUl,
  HomeSection,
  SearchButton,
  SearchContainer,
  SearchInput,
  VideosSection,
  MainHomePage,
  FailureViewContainer,
  FailureImg,
  FailureHeading,
  FailurePara,
  RetryButton,
  LoaderContainerH,
  FailureSearchImg,
  ShowNoResultsViewContainer,
  SearchFailureHeading,
  SearchFailurePara,
} from './styledComponent'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Home extends Component {
  state = {
    searchedInput: '',
    videosList: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getHomePageData()
  }

  getFormattedData = data => ({
    channel: {
      name: data.channel.name,
      profileImageUrl: data.channel.profile_image_url,
    },
    id: data.id,
    // publishedAt: formatDistanceToNow(new Date(data.published_at)),
    publishedAt: formatDistanceToNow(new Date(data.published_at), {
      addSuffix: true,
    })
      .split(' ')
      .reverse()
      .slice(0, 3)
      .reverse()
      .join(' '),
    thumbnailUrl: data.thumbnail_url,
    title: data.title,
    viewCount: data.view_count,
    isSaved: false,
  })

  getHomePageData = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {searchedInput} = this.state
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/videos/all?search=${searchedInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(url, options)

    if (response.ok === true) {
      const data = await response.json()
      const videosData = data.videos.map(each => this.getFormattedData(each))

      this.setState({
        videosList: videosData,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderVideosView = () => {
    const {videosList} = this.state
    return (
      <>
        {videosList.length === 0 ? (
          this.showNoResultsView()
        ) : (
          <VideoListUl>
            {videosList.map(each => (
              <VideoItem key={each.id} video={each} />
            ))}
          </VideoListUl>
        )}
      </>
    )
  }

  showNoResultsView = () => (
    <ShowNoResultsViewContainer>
      <FailureSearchImg
        src="https://assets.ccbp.in/frontend/react-js/nxt-watch-no-search-results-img.png"
        alt="no videos"
      />
      <SearchFailureHeading>No Search results found</SearchFailureHeading>
      <SearchFailurePara>
        Try different key words or remove search filter
      </SearchFailurePara>
      <RetryButton
        className="retry-button"
        data-testid="retry"
        type="button"
        onClick={this.retried}
      >
        Retry
      </RetryButton>
    </ShowNoResultsViewContainer>
  )

  retried = () => {
    this.getHomePageData()
  }

  renderFailureView = isDarkTheme => {
    const {showNoResults} = this.state
    return showNoResults ? (
      this.showNoResultsView()
    ) : (
      <FailureViewContainer>
        <FailureImg
          src={
            isDarkTheme
              ? 'https://assets.ccbp.in/frontend/react-js/nxt-watch-failure-view-dark-theme-img.png'
              : 'https://assets.ccbp.in/frontend/react-js/nxt-watch-failure-view-light-theme-img.png'
          }
          alt="failure view"
        />
        <FailureHeading>Oops! Something Went Wrong</FailureHeading>
        <FailurePara>
          We are having some trouble to complete your request. Please try again.
        </FailurePara>
        <RetryButton
          className="retry-button"
          type="button"
          data-testid="retry"
          onClick={this.getHomePageData}
        >
          Retry
        </RetryButton>
      </FailureViewContainer>
    )
  }

  renderLoadingView = isDarkTheme => (
    <LoaderContainerH data-testid="loader">
      <Loader
        type="ThreeDots"
        color={isDarkTheme ? '#ffffff' : '#0f0f0f'}
        height="50"
        width="50"
      />
    </LoaderContainerH>
  )

  renderVideos = isDarkTheme => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderVideosView()
      case apiStatusConstants.failure:
        return this.renderFailureView(isDarkTheme)
      case apiStatusConstants.inProgress:
        return this.renderLoadingView(isDarkTheme)
      default:
        return null
    }
  }

  onChangeSearchInput = event => {
    this.setState({searchedInput: event.target.value})
  }

  onSearched = () => {
    this.getHomePageData()
  }

  render() {
    const {searchedInput} = this.state

    return (
      <NxtContext.Consumer>
        {value => {
          const {isDarkTheme, buyPremiumShow} = value
          return (
            <MainHomePage data-testid="home" isDarkTheme={isDarkTheme}>
              <Header />
              <MainContainer>
                <SideBar isDarkTheme={isDarkTheme} />
                <HomeSection
                // isDarkTheme={isDarkTheme}
                >
                  {buyPremiumShow && <BuyPremiumView />}

                  <VideosSection>
                    <SearchContainer isDarkTheme={isDarkTheme}>
                      <SearchInput
                        value={searchedInput}
                        type="search"
                        placeholder="Search"
                        onChange={this.onChangeSearchInput}
                      />
                      <SearchButton
                        type="button"
                        className="searchButton"
                        data-testid="searchButton"
                        onClick={this.onSearched}
                      >
                        <BiSearchAlt2 color="grey" />
                      </SearchButton>
                    </SearchContainer>
                    {this.renderVideos(isDarkTheme)}
                  </VideosSection>
                </HomeSection>
              </MainContainer>
            </MainHomePage>
          )
        }}
      </NxtContext.Consumer>
    )
  }
}

export default Home
