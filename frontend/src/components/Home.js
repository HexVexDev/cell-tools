import { Col, Container, Row, Carousel } from "react-bootstrap";
import '../styles/mainStyles.css'
import celllogo from '../svgIcons/weblogo.jpg'
import slide2 from '../svgIcons/Slide 2.png'
import slide3 from '../svgIcons/Slide 3.png'



const Home = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1 className="welcome">Welcome to Cell Tools!</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>This webpage project was designed to help in the tasks of analyzing
            fluorescent images obtained in a series of scenarios, whether you wish tool
            <b> extract individual fluorophore intensity</b> or to determine if said
            fluorophore exhibits a <b>clustering behaviour.</b>
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="carousel-container">
            <Carousel controls={false} fade>
              <Carousel.Item >
                <img src={celllogo} />
                <Carousel.Caption className="custom-caption">
                  <h3 className="bold">A project for free analysis</h3>
                  <p>Use multiple tools to analyze your images</p>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <img src={slide2} />
                <Carousel.Caption className="custom-caption">
                  <h3 className="bold">Color extraction</h3>
                  <p>Separate the colors of your image that represent different markers</p>
                </Carousel.Caption>
              </Carousel.Item>
              <Carousel.Item>
                <img src={slide3} />
                <Carousel.Caption className="custom-caption">
                  <h3 className="bold">Cluster Statistics</h3>
                  <p>
                    Evaluate a set of clusters for statistical significance using Ripley's K function.
                  </p>
                </Carousel.Caption>
              </Carousel.Item>
            </Carousel>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Home;