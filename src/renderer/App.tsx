import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Echo } from "@/showcase/components/echo";

export default function App() {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Tabs defaultValue="echo" className="w-full p-4">
        <TabsList>
          <TabsTrigger value="echo">Echo</TabsTrigger>
        </TabsList>
        <TabsContent value="echo">
          <Echo />
        </TabsContent>
      </Tabs>
    </main>
  );
}
