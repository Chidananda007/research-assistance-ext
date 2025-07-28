package com.research.assistance;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResearchService {

  private final WebClient webClient = WebClient.builder().build();

  @Value("${app.gemini.api.url}")
  private String geminiApiUrl;

  @Value("${app.gemini.api.key}")
  private String geminiApiKey;

  public String processQuery(ResearchDto.ResearchRequest request) {

    var requestBody =
        Map.of(
            "contents",
            new Object[] {
              Map.of("parts", new Object[] {Map.of("text", this.buildPrompt(request))})
            });

    var format = String.format("%s%s", geminiApiUrl, geminiApiKey);

    var response =
        webClient
            .post()
            .uri(format)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .block();

    return parseResponse(response);
  }

  private String parseResponse(String geminiResponse) {
    try {
      log.info("Gemini Response: {}", geminiResponse);
      var response = new ObjectMapper().readValue(geminiResponse, ResearchDto.GeminiResponse.class);

      if (Objects.nonNull(response) && !CollectionUtils.isEmpty(response.candidates())) {
        var candidate = response.candidates().getFirst();
        if (Objects.nonNull(candidate.content())
            && !CollectionUtils.isEmpty(candidate.content().parts())) {
          return "<p> " + candidate.content().parts().getFirst().text() + "</p>";
        }
      }

    } catch (Exception e) {
      throw new RuntimeException("Error while parsing the response: " + e.getMessage(), e);
    }
    return "No Content found from response";
  }

  private String buildPrompt(ResearchDto.ResearchRequest request) {

    StringBuilder promptBuilder = new StringBuilder();

    switch (request.operationType()) {
      case SUMMARIZE ->
          promptBuilder.append(
              "Provide a clear and concise summary of the following content in a few sentence: \n\n");
      case EXPLAIN ->
          promptBuilder.append(
              "Based on the following content: suggest related topics and further reading.Format the reponse with clear headings and bulleted points:\n\n");
      default ->
          throw new IllegalArgumentException(
              "Unsupported operation type: " + request.operationType());
    }
    promptBuilder.append(request.content());
    return promptBuilder.toString();
  }
}
