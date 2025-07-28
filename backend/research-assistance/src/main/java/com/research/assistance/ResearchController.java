package com.research.assistance;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/research")
@CrossOrigin(
    origins = "*",
    allowedHeaders = "*",
    methods = {RequestMethod.POST, RequestMethod.OPTIONS})
@RequiredArgsConstructor
public class ResearchController {

  private final ResearchService researchService;

  @PostMapping("/process")
  public ResponseEntity<String> processResearch(
      @Valid @RequestBody ResearchDto.ResearchRequest request) {

    return ResponseEntity.ok(researchService.processQuery(request));
  }
}
