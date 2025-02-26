import { useSession } from "next-auth/react";
import { Button, Container, Row, Col, Card } from "bootstrap";
import { useRouter } from "next/router";

export default function HomePage() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleDashboardClick = () => {
        router.push("/dashboard");
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Body className="p-4">
                            <Card.Title as="h1" className="text-center mb-4">Welcome to RunLogger</Card.Title>

                            {session ? (
                                <div className="text-center">
                                    <div className="mb-4">
                                        <h4>Hello, {session.user?.name}! 👋</h4>
                                        <p className="text-muted">Ready to track your running progress?</p>
                                    </div>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={handleDashboardClick}
                                        className="px-4"
                                    >
                                        Go to Dashboard
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="mb-4">Please log in to access your running dashboard and stats.</p>
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => router.push("/Login")}
                                    >
                                        Sign In
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

