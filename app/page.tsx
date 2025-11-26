import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BackgroundRemover from "@/components/background-remover";
import ImageUpscaler from "@/components/image-upscaler";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Design Tool</h1>
          <p className="text-muted-foreground">AI-powered tools for designers</p>
        </div>

        <Tabs defaultValue="remove-bg" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="remove-bg">Remove BG</TabsTrigger>
            <TabsTrigger value="upscale">Upscale</TabsTrigger>
            <TabsTrigger value="enhance" disabled>Enhance</TabsTrigger>
            <TabsTrigger value="more" disabled>More</TabsTrigger>
          </TabsList>

          <TabsContent value="remove-bg" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Background Removal</CardTitle>
                <CardDescription>
                  Upload images and remove backgrounds automatically using AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BackgroundRemover />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upscale" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Upscaling</CardTitle>
                <CardDescription>
                  Enhance image resolution using Recraft AI's crisp upscaling technology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpscaler />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enhance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Enhancement</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="more" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>More Tools</CardTitle>
                <CardDescription>Coming soon...</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
