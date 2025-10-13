
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <>
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Application Settings</CardTitle>
                    <CardDescription>Manage your application settings here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Settings content will go here.</p>
                </CardContent>
            </Card>
        </>
    )
}
