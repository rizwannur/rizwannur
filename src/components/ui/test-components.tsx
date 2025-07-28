"use client";

import React from "react";
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter, 
  Badge, 
  Separator,
  Input,
  Textarea,
  Label
} from "./index";

export function TestComponents() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Button Component Test</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-bold mb-4">Card Component Test</h2>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card using shadcn/ui components</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here. This demonstrates the Card component functionality.</p>
          </CardContent>
          <CardFooter>
            <Button>Action Button</Button>
          </CardFooter>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-bold mb-4">Badge Component Test</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
          <Badge variant="outline">Outline Badge</Badge>
          <Badge variant="destructive">Destructive Badge</Badge>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-xl font-bold mb-4">Form Components Test</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="test-input">Test Input</Label>
            <Input id="test-input" placeholder="Enter some text..." />
          </div>
          <div>
            <Label htmlFor="test-textarea">Test Textarea</Label>
            <Textarea id="test-textarea" placeholder="Enter a longer message..." />
          </div>
        </div>
      </div>
    </div>
  );
}
