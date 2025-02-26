import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import WorkoutList from "../components/WorkoutList";
import AddWorkout from "../components/AddWorkout";
import { Container, Row, Col, Card } from "react-bootstrap";

export default function UserDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/Login");
        } else if (status === "authenticated") {
            setIsLoading(false);
        }
    }, [status, router]);

    if (isLoading) {
        return (
            <Container className="py-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    if (!session?.user) {
        return (
            <Container className="py-5 text-center">
                <h2>Please log in to view your dashboard</h2>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h1 className="mb-3">Welcome, {session.user.name}!</h1>
                            <p className="text-muted">Track and manage your fitness journey all in one place.</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                    <AddWorkout userId={session.user.id} />
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h3>Quick Stats</h3>
                            <p>Coming soon...</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <WorkoutList userId={session.user.id} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
