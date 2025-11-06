import dynamic from "next/dynamic";

const RedocStandalone = dynamic(
  () => import("redoc").then((mod) => mod.RedocStandalone),
  { ssr: false }
);

export default function ApiInspector() {
  return (
    <div className="h-screen w-full redoc-container">
      <RedocStandalone
        specUrl="/api/openapi.json"
        options={{
          scrollYOffset: 50,
          theme: {
            colors: {
              primary: { main: "#2563eb" },
              text: {
                primary: "#111827",
                secondary: "#374151",
              },
            },
            typography: {
              fontSize: "14px",
              fontFamily: "Arial, Helvetica, sans-serif",
            },
          },
        }}
      />
    </div>
  );
}