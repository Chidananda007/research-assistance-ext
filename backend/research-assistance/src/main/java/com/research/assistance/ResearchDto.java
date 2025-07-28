package com.research.assistance;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Builder;

public record ResearchDto() {

  @Builder
  public record ResearchRequest(@NotNull String content, @NotNull OperationType operationType) {}

  public enum OperationType {
    SUMMARIZE,
    EXPLAIN,
    ANALYZE,
    EVALUATE,
    SEARCH
  }

  @Builder
  @JsonIgnoreProperties(ignoreUnknown = true)
  public record GeminiResponse(
      List<Candidate> candidates,
      String responseId,
      String modelVersion,
      UsageMetadata usageMetadata) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record UsageMetadata(
      String promptTokenCount, String candidatesTokenCount, int totalTokenCount) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record Candidate(Content content, String finishReason, String avgLogprobs) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record Content(List<Part> parts) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record Part(String text) {}
}
