<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class TwigController {
  #[Route('/twig', name: 'twig_render')]
  public function render(Request $request): Response {
      $input = $request->query->get('input');
      return new JsonResponse(['success' => TRUE]);
  }
}
