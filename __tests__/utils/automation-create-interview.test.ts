import { describe, expect, it } from "vitest";
import {
  applyFreeTextToDraft,
  canCreateAutomationFromDraft,
  createEmptyAutomationDraft,
  draftToAutomationSpec,
  formatInterviewReply,
  getNextInterviewField,
  inferRequiredIntegrationIds,
  insertTokenIntoPrompt,
  integrationHintsFromAutomation,
  integrationHintsFromDraft,
  parseAutomationInterviewFences,
  presentInterviewChatMessage,
  sanitizeDraftPatch,
  stripAutomationInterviewFences,
  suggestNameFromPrompt,
} from "#/utils/automation-create-interview";
import { matchCatalogIntegrationIds } from "#/utils/automation-required-integrations";

function draftWith(
  overrides: Partial<ReturnType<typeof createEmptyAutomationDraft>>,
) {
  return { ...createEmptyAutomationDraft("conv-1"), ...overrides };
}

describe("automation create interview", () => {
  it("walks required fields in interview order", () => {
    const empty = createEmptyAutomationDraft("conv-1");
    expect(getNextInterviewField(empty)).toBe("intent");

    const withPrompt = draftWith({ prompt: "Summarize standups" });
    expect(getNextInterviewField(withPrompt)).toBe("triggerType");

    const schedule = draftWith({
      prompt: "Summarize standups",
      triggerType: "schedule",
    });
    expect(getNextInterviewField(schedule)).toBe("schedule");

    const events = draftWith({
      prompt: "Review new PRs",
      triggerType: "event",
    });
    expect(getNextInterviewField(events)).toBe("events");

    const named = draftWith({
      prompt: "Summarize standups",
      triggerType: "schedule",
      schedulePreset: "weekdays",
      name: "Standup digest",
    });
    expect(getNextInterviewField(named)).toBe("tokens");

    const ready = draftWith({
      prompt: "Summarize standups",
      triggerType: "schedule",
      schedulePreset: "weekdays",
      name: "Standup digest",
      tokensResolved: true,
    });
    expect(getNextInterviewField(ready)).toBe("review");
  });

  it("maps a complete schedule draft onto the create spec", () => {
    const spec = draftToAutomationSpec(
      draftWith({
        name: "Standup digest",
        prompt: "Post a standup summary",
        triggerType: "schedule",
        schedulePreset: "weekdays",
        timezone: "America/Los_Angeles",
        repository: "acme/app",
        branch: "main",
      }),
    );

    expect(spec).toEqual({
      name: "Standup digest",
      prompt: "Post a standup summary",
      enabled: false,
      trigger: {
        type: "cron",
        schedule: "30 8 * * 1-5",
        timezone: "America/Los_Angeles",
      },
      timezone: "America/Los_Angeles",
      repository: "acme/app",
      branch: "main",
    });
    expect(canCreateAutomationFromDraft(draftWith({ name: "x" }))).toBe(false);
  });

  it("maps event drafts and ignores unknown fence fields", () => {
    const spec = draftToAutomationSpec(
      draftWith({
        name: "PR review",
        prompt: "Review new pull requests",
        triggerType: "event",
        integration: "github",
        selectedEvents: ["pull_request.opened"],
      }),
    );

    expect(spec.trigger).toEqual({
      type: "event",
      source: "github",
      on: ["pull_request.opened"],
    });
    expect(sanitizeDraftPatch({ triggerType: "webhook", name: 1 })).toEqual({});
    expect(
      sanitizeDraftPatch({
        requiredIntegrations: ["notion", "not-a-catalog-id", "tavily"],
      }),
    ).toEqual({ requiredIntegrations: ["notion", "tavily"] });
  });

  it("parses agent draft and ui fences", () => {
    const parsed = parseAutomationInterviewFences(`
Ask the next question.

\`\`\`automation-draft
{"name":"CI watchdog","triggerType":"event","selectedEvents":["push"],"requiredIntegrations":["tavily"]}
\`\`\`

\`\`\`automation-ui
{"field":"schedule"}
\`\`\`
`);

    expect(parsed.draftPatches).toEqual([
      {
        key: 'automation-draft:{"name":"CI watchdog","triggerType":"event","selectedEvents":["push"],"requiredIntegrations":["tavily"]}',
        patch: {
          name: "CI watchdog",
          triggerType: "event",
          selectedEvents: ["push"],
          requiredIntegrations: ["tavily"],
        },
      },
    ]);
    expect(parsed.uiFields).toEqual([
      {
        key: 'automation-ui:{"field":"schedule"}',
        field: "schedule",
      },
    ]);
  });

  it("accepts the fence languages the agent actually emits", () => {
    const parsed = parseAutomationInterviewFences(`
\`\`\`json
{"field":"intent"}
\`\`\`

\`\`\`automation
{"intent":"Write a sonnet every morning"}
\`\`\`
`);

    expect(parsed.uiFields.map((item) => item.field)).toEqual(["intent"]);
    expect(parsed.draftPatches.map((item) => item.patch)).toEqual([
      { prompt: "Write a sonnet every morning" },
    ]);
  });

  it("hides interview protocol from chat copy", () => {
    expect(
      presentInterviewChatMessage(
        "[automation-interview] intent=write a sonnet every morning",
        "user",
      ),
    ).toBe("write a sonnet every morning");
    expect(
      presentInterviewChatMessage(
        "Create an automation. Ask one question at a time and wait for my answers.",
        "user",
      ),
    ).toBeNull();
    expect(
      stripAutomationInterviewFences(`Nice — noted.

\`\`\`automation
{"field":"schedule","question":"When?"}
\`\`\`
`),
    ).toBe("Nice — noted.");
  });

  it("applies free text only to the current text field", () => {
    expect(
      applyFreeTextToDraft(createEmptyAutomationDraft("c"), "Watch CI"),
    ).toEqual({ prompt: "Watch CI" });
    expect(
      applyFreeTextToDraft(
        draftWith({ prompt: "Watch CI" }),
        "this should not bind",
      ),
    ).toBeNull();
    expect(
      applyFreeTextToDraft(
        createEmptyAutomationDraft("c"),
        formatInterviewReply("triggerType", "schedule"),
      ),
    ).toBeNull();
  });

  it("infers required integrations from the event source, catalog copy, and agent list", () => {
    expect(
      inferRequiredIntegrationIds(
        integrationHintsFromDraft(
          draftWith({
            prompt: "Post a standup digest to Slack",
            triggerType: "schedule",
            schedulePreset: "weekdays",
          }),
        ),
      ),
    ).toEqual(["slack"]);
    expect(
      inferRequiredIntegrationIds(
        integrationHintsFromDraft(
          draftWith({
            prompt: "Review new pull requests",
            triggerType: "event",
            integration: "github",
            selectedEvents: ["pull_request.opened"],
          }),
        ),
      ),
    ).toEqual(["github"]);
    expect(
      inferRequiredIntegrationIds(
        integrationHintsFromDraft(
          draftWith({
            prompt: "Save the notes in Notion and file a Jira ticket",
            triggerType: "schedule",
            schedulePreset: "weekdays",
          }),
        ),
      ),
    ).toEqual(["notion", "jira"]);
    expect(
      inferRequiredIntegrationIds(
        integrationHintsFromDraft(
          draftWith({
            prompt: "Research the topic",
            triggerType: "schedule",
            schedulePreset: "weekdays",
            requiredIntegrations: ["tavily"],
          }),
        ),
      ),
    ).toEqual(["tavily"]);
    expect(
      inferRequiredIntegrationIds(
        integrationHintsFromDraft(
          draftWith({
            prompt: "A linear improvement to the standup notes every Monday",
            triggerType: "schedule",
            schedulePreset: "weekdays",
          }),
        ),
      ),
    ).toEqual([]);
  });

  it("matches catalog product names and skips ambiguous English words", () => {
    expect(matchCatalogIntegrationIds("Add it to Google Calendar")).toEqual([
      "google-calendar",
    ]);
    expect(matchCatalogIntegrationIds("Sync the Monday.com board")).toEqual([
      "monday",
    ]);
    expect(matchCatalogIntegrationIds("A linear improvement")).toEqual([]);
    expect(matchCatalogIntegrationIds("Run this every Monday")).toEqual([]);
  });

  it("infers required integrations from a saved automation", () => {
    expect(
      inferRequiredIntegrationIds(
        integrationHintsFromAutomation({
          name: "Standup digest",
          prompt: "Post a standup digest to Slack",
          trigger: { type: "schedule" },
        }),
      ),
    ).toEqual(["slack"]);
    expect(
      inferRequiredIntegrationIds(
        integrationHintsFromAutomation({
          name: "PR review",
          prompt: "Review new pull requests",
          trigger: { type: "event", source: "github" },
        }),
      ),
    ).toEqual(["github"]);
  });

  it("inserts prompt tokens and suggests a name", () => {
    expect(insertTokenIntoPrompt("Review", "{{event.title}}")).toBe(
      "Review {{event.title}}",
    );
    expect(suggestNameFromPrompt("Post a standup summary every weekday")).toBe(
      "Post a standup summary every weekday",
    );
  });
});
