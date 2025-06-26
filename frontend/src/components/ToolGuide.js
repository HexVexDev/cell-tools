import { Row,Container,Col } from "react-bootstrap";
import "../styles/toolGuide.css"


const ToolGuide = ({data,toolImg}) =>{
    return(
        <Container className="tooldesc-container">
            <h2 className="header">What this tool does</h2>
            <Row>
                <Col className="tool-desc-box">
                <p>{data.toolDescription}</p>
                <img src={toolImg}/>
                </Col>
            </Row>
            <Row className="step-row">
                <h3>Steps to follow</h3>
                {data.steps.map((step,index)=>(
                    <Col className="tool-step-box">
                        <h4>{index+1}. {step.briefDescription}</h4>
                        <p>{step.deepDescription}</p>
                    </Col>
                ))}
            </Row>
        </Container>

    )
}
export default ToolGuide;