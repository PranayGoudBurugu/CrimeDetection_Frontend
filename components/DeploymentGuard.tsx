
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// DEPLOYMENT CONFIGURATION
// To renew the deployment and enable access, update the DEPLOYMENT_DATE below
// Set it to a date in the future (e.g., 30 days from now)
const DEPLOYMENT_DATE = new Date('2024-01-01T00:00:00Z'); // Set to PAST date to trigger "Credits Exhausted"
const DEPLOYMENT_VALIDITY_DAYS = 30; // Deployment valid for 30 days

// Calculate expiration date
const expirationDate = new Date(DEPLOYMENT_DATE);
expirationDate.setDate(expirationDate.getDate() + DEPLOYMENT_VALIDITY_DAYS);

// Check if deployment is expired
function isDeploymentExpired(): boolean {
    const now = new Date();
    return now > expirationDate;
}

interface DeploymentGuardProps {
    children: React.ReactNode;
}

export const DeploymentGuard: React.FC<DeploymentGuardProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        const checkDeployment = () => {
            // Always allow access to the exhausted page
            if (location.pathname === '/credits-exhausted') {
                setIsChecked(true);
                return;
            }

            // Check if deployment is expired
            if (isDeploymentExpired()) {
                // Redirect to exhausted page
                navigate('/credits-exhausted', { replace: true });
                return;
            }

            // If valid, allow rendering
            setIsChecked(true);
        };

        checkDeployment();
    }, [location.pathname, navigate]);

    // If we haven't checked yet (or are redirecting), don't render children to prevent flash
    if (!isChecked && location.pathname !== '/credits-exhausted' && isDeploymentExpired()) {
        return null;
    }

    return <>{children}</>;
};
