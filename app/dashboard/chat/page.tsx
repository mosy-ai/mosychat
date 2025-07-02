'use client';

import React, { useState, useEffect } from 'react';
import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, AlertCircle } from 'lucide-react';
import "@copilotkit/react-ui/styles.css";

const AgenticChat: React.FC = () => {
    const [user, setUser] = useState<{ id: string; username: string; role: string; langgr_url: string | null; agent_name: string | null } | null>(null);
    const [loading, setLoading] = useState(true);
    const [configError, setConfigError] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await fetch('/api/auth/verify');
                const userData = await response.json();
                if (userData.success && userData.authenticated) {
                    setUser(userData.user);
                    console.log('User data:', userData.user);
                    // Check if user has agent configuration
                    if (!userData.user.langgr_url || !userData.user.agent_name) {
                        setConfigError('Your agent configuration is not set. Please contact an administrator.');
                    }
                }
            } catch (error) {
                console.error('Failed to get user:', error);
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, []);

    if (loading) {
        return (
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                Loading chat...
            </div>
        );
    }

    if (!user) {
        return <div>User not authenticated</div>;
    }

    if (configError) {
        return (
            <div className="flex justify-center items-center min-h-screen w-full">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Configuration Required</h3>
                        <p className="text-muted-foreground">{configError}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <CopilotKit
            runtimeUrl="/api/copilotkit"
            showDevConsole={false}
            agent={user.agent_name || "default-agent"}
            headers={{ "x-user-id": user.username }}
        >
            <Chat user={user} />
        </CopilotKit>
    );
};

const Chat = ({ user }: { user: { id: string; username: string; role: string; langgr_url: string | null; agent_name: string | null } }) => {
    const [background, setBackground] = useState<string>("#fefefe");

    return (
        <div
            className="flex justify-center items-center min-h-screen w-full"
            style={{ background }}
        >
            <div className="w-8/10 h-[90vh] rounded-lg">
                <Card className="h-full">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Bot className="h-6 w-6 text-primary" />
                            <CardTitle className="text-2xl">
                                {user.agent_name ? `${user.agent_name} Chat` : 'MosyAI Chat'}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="h-full pb-6">
                        <CopilotChat
                            className="h-full w-full rounded-lg"
                            labels={{
                                placeholder: "Type your message here...",
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default function ChatPage() {
    return (
        <DashboardLayout>
            <AgenticChat />
        </DashboardLayout>
    );
}
