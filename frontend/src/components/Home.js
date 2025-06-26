import { Col, Container, Row, Carousel } from "react-bootstrap";
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser'
import '../styles/mainStyles.css'
import celllogo from '../svgIcons/weblogo.jpg'
import slide2 from '../svgIcons/Slide 2.png'
import slide3 from '../svgIcons/Slide 3.png'



const Home = () => {


const serviceID =process.env.REACT_APP_SERVICE_ID;
const templateID = process.env.REACT_APP_TEMPLATE_ID;
const userID = process.env.REACT_APP_USER_ID;

function sendEmail(e) {
  e.preventDefault(); // Prevents form reload

  // Show loading modal
  Swal.fire({
    title: 'Sending email...',
    text: 'Please wait a moment.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  emailjs.sendForm(serviceID, templateID, e.target, userID)
    .then((result) => {
      // Check for status
      if (result.status === 200) {
        e.target.reset();
        Swal.fire({
          icon: 'success',
          title: 'Sent!',
          text: 'Your email was sent successfully.',
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(`Unexpected status: ${result.status}`);
      }
    })
    .catch((error) => {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to send',
        text: 'There was an error sending your email. Please try again.',
      });
    });
}
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
      <Row className="contact-container">
        <Col className="data-wrapper">
              <h5>If you liked this project send me a message:</h5>
              <form className="contact-form" onSubmit={sendEmail}>
                <label>Company Name</label>
                <input className="comp-name" type="text" name="name" required />
                <label>Message</label>
                <textarea className="comp-message" name="message" required/>
                <input type="submit" value="Send" />
              </form>
        </Col>
      </Row>
    </Container>
  )
}

export default Home;