import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BackgroundRemoverTool from "@/components/features/background-remover/background-remover-tool";
import ImageUpscalerTool from "@/components/features/image-upscaler/image-upscaler-tool";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { TEXTS } from "@/constants/texts";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок страницы */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{TEXTS.home.title}</h1>
            <p className="text-muted-foreground">{TEXTS.home.description}</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Табы с инструментами */}
        <Tabs defaultValue="remove-bg" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="remove-bg">
              {TEXTS.tools.backgroundRemover.tabName}
            </TabsTrigger>
            <TabsTrigger value="upscale">
              {TEXTS.tools.imageUpscaler.tabName}
            </TabsTrigger>
            <TabsTrigger value="enhance" disabled>
              {TEXTS.tools.imageEnhancer.tabName}
            </TabsTrigger>
            <TabsTrigger value="more" disabled>
              {TEXTS.tools.moreTools.tabName}
            </TabsTrigger>
          </TabsList>

          {/* Удаление фона */}
          <TabsContent value="remove-bg" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{TEXTS.tools.backgroundRemover.name}</CardTitle>
                <CardDescription>
                  {TEXTS.tools.backgroundRemover.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BackgroundRemoverTool />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Увеличение разрешения */}
          <TabsContent value="upscale" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{TEXTS.tools.imageUpscaler.name}</CardTitle>
                <CardDescription>
                  {TEXTS.tools.imageUpscaler.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpscalerTool />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Улучшение изображений (скоро) */}
          <TabsContent value="enhance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{TEXTS.tools.imageEnhancer.name}</CardTitle>
                <CardDescription>{TEXTS.tools.imageEnhancer.description}</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* Ещё инструменты (скоро) */}
          <TabsContent value="more" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{TEXTS.tools.moreTools.name}</CardTitle>
                <CardDescription>{TEXTS.tools.moreTools.description}</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
