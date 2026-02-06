
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// DEPLOYMENT CONFIGURATION
// To renew the deployment and enable access, update the DEPLOYMENT_DATE below
// Set it to a date in the future (e.g., 30 days from now)
const DEPLOYMENT_DATE = new Date('2025-01-01T00:00:00Z'); // Set to PAST date to trigger "Credits Exhausted"
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
        // Prevent infinite loops if we are already on the exhausted page
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

        // If not expired, allow rendering
        setIsChecked(true);
    }, [location.pathname, navigate]);

    // Handle the render state
    // 1. If on the exhausted page, render children (which is the Route for it)
    if (location.pathname === '/credits-exhausted') {
        return <>{children}</>;
    }

    // 2. If expired and not on the page yet, render nothing while redirecting
    if (isDeploymentExpired()) {
        return null;
    }

    // 3. If checked and valid, render children
    if (isChecked) {
        return <>{children}</>;
    }

    // 4. Initial state before check, render nothing
    return null;
};
