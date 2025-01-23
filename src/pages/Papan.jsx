import { Col, Container, Row, Button } from "react-bootstrap";

const Papan = () =>{
    return(
        <>
            <div className='limiter'>
                <div className="bg-container">
                    <Container className="h-min75" fluid>
                        <Row className="mb-1 pb-1">
                            <Col md={3}>
                                <div className="main-display d-flex flex-column justify-content-evenly align-items-center">
                                    <h1 className="fs-big">A - 2</h1>
                                    <h4>PTSP Perdata</h4>
                                </div>
                            </Col>
                            <Col md={9}>
                                <div className="main-display d-flex flex-column justify-content-evenly align-items-center p-1">
                                    <div className="red-box"></div>
                                    <Button size="sm">Play</Button>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div className="main-display">
                                    <Row className="p-1">
                                        <Col className="d-flex flex-column justify-content-evenly align-items-center">1</Col>
                                        <Col className="d-flex flex-column justify-content-evenly align-items-center">2</Col>
                                        <Col className="d-flex flex-column justify-content-evenly align-items-center">3</Col>
                                        <Col className="d-flex flex-column justify-content-evenly align-items-center">4</Col>
                                        <Col className="d-flex flex-column justify-content-evenly align-items-center">5</Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        </>
    )
}

export default Papan;