import { act, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { useAuth } from "@app/auth/UseSession";
import { AppConfigProvider } from "@app/contexts/AppConfigContext";
import {
  QuickNavHostProvider,
  useQuickNavHost,
} from "@app/contexts/QuickNavHostContext";
import { QuickNavHostBridge } from "@app/components/shared/quickNav/QuickNavHostBridge";

const auth = vi.hoisted<
  Pick<ReturnType<typeof useAuth>, "displayName" | "loading" | "isAnonymous">
>(() => ({ displayName: "Ada", loading: false, isAnonymous: false }));
const picture = vi.hoisted<{ url: string | null; loading: boolean }>(() => ({
  url: "/ada.png",
  loading: false,
}));
const getAccountData = vi.hoisted(() => vi.fn());

vi.mock("@app/auth/UseSession", () => ({ useAuth: () => auth }));
vi.mock("@app/hooks/useProfilePictureUrl", () => ({
  useProfilePictureUrl: () => picture.url,
  useProfilePictureLoading: () => picture.loading,
}));
vi.mock("@app/services/accountService", () => ({
  accountService: { getAccountData },
}));
vi.mock("@app/services/thumbnailGenerationService", () => ({
  thumbnailGenerationService: { generateThumbnails: vi.fn(async () => []) },
}));

function IdentityProbe() {
  const host = useQuickNavHost();
  const identity = host?.identity;
  return (
    <div>
      <span data-testid="identity-name">
        {identity?.displayName ?? "none"}
      </span>
      <span data-testid="identity-pic">
        {identity?.profilePictureUrl ?? "none"}
      </span>
    </div>
  );
}

function setup(enableLogin = false) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const markup = (view: string | null) => (
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <QuickNavHostProvider>
          <IdentityProbe />
          {view && (
            <AppConfigProvider
              key={view}
              autoFetch={false}
              bootstrapMode="non-blocking"
              initialConfig={{ enableLogin }}
            >
              <QuickNavHostBridge />
            </AppConfigProvider>
          )}
        </QuickNavHostProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
  const view = render(markup("editor"));
  return (name: string | null) => view.rerender(markup(name));
}

describe("quick-nav identity during view switches", () => {
  beforeEach(() => {
    auth.displayName = "Ada";
    auth.loading = false;
    picture.url = "/ada.png";
    picture.loading = false;
    getAccountData.mockReset();
  });

  it("keeps the name and avatar through unmount, session loading and picture loading", () => {
    const switchView = setup();
    expect(screen.getByTestId("identity-name")).toHaveTextContent("Ada");
    expect(screen.getByTestId("identity-pic")).toHaveTextContent("/ada.png");

    switchView(null);
    expect(screen.getByTestId("identity-name")).toHaveTextContent("Ada");
    expect(screen.getByTestId("identity-pic")).toHaveTextContent("/ada.png");

    auth.displayName = null;
    auth.loading = true;
    picture.url = null;
    picture.loading = true;
    switchView("processor");
    expect(screen.getByTestId("identity-name")).toHaveTextContent("Ada");
    expect(screen.getByTestId("identity-pic")).toHaveTextContent("/ada.png");

    auth.displayName = "Grace";
    auth.loading = false;
    switchView("processor");
    expect(screen.getByTestId("identity-name")).toHaveTextContent("Ada");
    expect(screen.getByTestId("identity-pic")).toHaveTextContent("/ada.png");

    picture.url = "/grace.png";
    picture.loading = false;
    switchView("processor");
    expect(screen.getByTestId("identity-name")).toHaveTextContent("Grace");
    expect(screen.getByTestId("identity-pic")).toHaveTextContent("/grace.png");

    auth.displayName = null;
    picture.url = null;
    auth.loading = true;
    switchView("editor");
    expect(screen.getByTestId("identity-name")).toHaveTextContent("Grace");
    expect(screen.getByTestId("identity-pic")).toHaveTextContent("/grace.png");

    auth.loading = false;
    switchView("editor");
    expect(screen.getByTestId("identity-name")).toHaveTextContent("none");
    expect(screen.getByTestId("identity-pic")).toHaveTextContent("none");
  });

  it("waits for the account endpoint before replacing an identity without an auth name", async () => {
    let resolveAccount = (_value: { username: string }) => {};
    getAccountData.mockReturnValue(
      new Promise<{ username: string }>((resolve) => {
        resolveAccount = resolve;
      }),
    );
    const switchView = setup(true);

    auth.displayName = null;
    picture.url = null;
    switchView("processor");
    expect(screen.getByTestId("identity-name")).toHaveTextContent("Ada");
    expect(screen.getByTestId("identity-pic")).toHaveTextContent("/ada.png");

    await act(async () => resolveAccount({ username: "Grace" }));
    expect(screen.getByTestId("identity-name")).toHaveTextContent("Grace");
    expect(screen.getByTestId("identity-pic")).toHaveTextContent("none");
  });

  it("replaces the cached identity when the account lookup rejects after sign-out", async () => {
    let rejectAccount = (_reason: Error) => {};
    getAccountData.mockReturnValue(
      new Promise<never>((_resolve, reject) => {
        rejectAccount = reject;
      }),
    );
    const switchView = setup(true);

    auth.displayName = null;
    picture.url = null;
    switchView("processor");
    expect(screen.getByTestId("identity-name")).toHaveTextContent("Ada");

    await act(async () => rejectAccount(new Error("Signed out")));
    expect(screen.getByTestId("identity-name")).toHaveTextContent("none");
    expect(screen.getByTestId("identity-pic")).toHaveTextContent("none");
  });
});
