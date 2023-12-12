import App from "./App";

export interface Mode {
  online?: { user: "white" | "black" };
}

const links: { name: string; href: string; mode: Mode }[] = [
  { name: "Offline", href: "/offline", mode: {} },
  {
    name: "Online (White)",
    href: "/online?user=white",
    mode: { online: { user: "white" } },
  },
  {
    name: "Online (Black)",
    href: "/online?user=black",
    mode: { online: { user: "black" } },
  },
];

function getMode(href: string) {
  const url = new URL(href);
  switch (url.pathname) {
    case "/offline": {
      return {};
    }
    case "/online": {
      const user = url.searchParams.get("user");
      const mode: Mode = {};
      if (user === "white" || user === "black") {
        mode.online = { user };
        return mode;
      }
      break;
    }
  }
}

export function Root() {
  const mode = getMode(window.location.href);

  if (mode) {
    return <App mode={mode} />;
  }

  return (
    <div className="title-page">
      <h1>Quoridor</h1>
      <div className="play-mode-menu">
        {links.map((link) => (
          <a key={link.name} href={link.href}>
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
}
