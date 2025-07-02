'use client';

import React, { useState, useEffect } from 'react';
import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import "@copilotkit/react-ui/styles.css";

const AgenticChat: React.FC = () => {
    const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await fetch('/api/auth/verify');
                const userData = await response.json();
                if (userData.success && userData.authenticated) {
                    setUser(userData.user);
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

    return (
        <CopilotKit
            runtimeUrl="/api/copilotkit"
            showDevConsole={false}
            agent={process.env.NEXT_PUBLIC_COPILOTKIT_AGENT_NAME || ""}
            headers={{ "x-user-id": user.username }}
        >
            <Chat user={user} />
        </CopilotKit>
    );
};

const Chat = ({ user }: { user: { id: string; username: string; role: string } }) => {
    const [background, setBackground] = useState<string>("#fefefe");

    return (
        <div
            className="flex justify-center items-center min-h-screen w-full"
            style={{ background }}
        >
            {/* title */}
            <div className="w-8/10 h-[90vh] rounded-lg">
            <Card className="h-full">
                <CardHeader>
                <div className="flex items-center space-x-2">
                    <Bot className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">MosyAI Chat</CardTitle>
                </div>
                </CardHeader>
                <CardContent className="h-full pb-6">
                <CopilotChat
                    // add user identifier to the chat
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
