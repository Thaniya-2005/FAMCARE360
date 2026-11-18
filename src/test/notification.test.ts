import { describe, it, expect } from "vitest";

describe("Notification Processing & Category Mapping", () => {
  const mapTypeToCategory = (type: string): "health" | "medicine" | "appointment" | "sos" => {
    switch (type) {
      case "medication":
      case "medicine":
        return "medicine";
      case "appointment":
        return "appointment";
      case "sos":
        return "sos";
      case "health":
      case "health_warning":
      case "care":
      case "check_in":
      default:
        return "health";
    }
  };

  it("should map medication and appointment types accurately", () => {
    expect(mapTypeToCategory("medication")).toBe("medicine");
    expect(mapTypeToCategory("medicine")).toBe("medicine");
    expect(mapTypeToCategory("appointment")).toBe("appointment");
  });

  it("should map emergency SOS and health categories correctly", () => {
    expect(mapTypeToCategory("sos")).toBe("sos");
    expect(mapTypeToCategory("health")).toBe("health");
    expect(mapTypeToCategory("health_warning")).toBe("health");
    expect(mapTypeToCategory("check_in")).toBe("health");
    expect(mapTypeToCategory("unknown_custom")).toBe("health");
  });

  it("should accurately calculate unread count from mixed notification records", () => {
    const list = [
      { id: "1", title: "Medication", read: false },
      { id: "2", title: "Appointment", read: true },
      { id: "3", title: "SOS Alert", read: false },
      { id: "4", title: "Check-in", read: true },
      { id: "5", title: "Health Update", read: false },
    ];
    const unread = list.filter((n) => !n.read).length;
    expect(unread).toBe(3);
  });

  it("should filter notifications by category and unread state", () => {
    const list = [
      { id: "1", type: "sos", read: false },
      { id: "2", type: "medication", read: true },
      { id: "3", type: "health", read: false },
    ];

    const unreadOnly = list.filter((n) => !n.read);
    expect(unreadOnly.length).toBe(2);

    const sosOnly = list.filter((n) => n.type === "sos");
    expect(sosOnly.length).toBe(1);
    expect(sosOnly[0].id).toBe("1");
  });

  it("should sanitize push notification payloads to protect clinical privacy", () => {
    // Lock-screen push payloads must not expose raw clinical vitals
    const sanitizePushPayload = (title: string, rawMessage: string) => {
      // Strips exact heart rate bpm or clinical metrics if present
      const sanitized = rawMessage.replace(/\b\d+\s*(bpm|mmHg|°F|°C)\b/gi, "[vital recorded]");
      return {
        title,
        body: sanitized,
      };
    };

    const payload = sanitizePushPayload(
      "Health Alert",
      "Heart rate reached 145 bpm and temp was 101 °F"
    );

    expect(payload.body).not.toContain("145 bpm");
    expect(payload.body).not.toContain("101 °F");
    expect(payload.body).toContain("[vital recorded]");
  });

  it("should handle device token active/inactive state transitions", () => {
    const tokens = [
      { token: "tok_1", user_id: "user_a", is_active: true },
      { token: "tok_2", user_id: "user_a", is_active: false },
      { token: "tok_3", user_id: "user_b", is_active: true },
    ];

    const activeUserTokens = tokens.filter((t) => t.user_id === "user_a" && t.is_active);
    expect(activeUserTokens.length).toBe(1);
    expect(activeUserTokens[0].token).toBe("tok_1");
  });
});
