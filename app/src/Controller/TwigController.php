<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class TwigController extends AbstractController {

  #[Route('/twig/{component}', name: 'twig_render')]
  public function storybookRequest(string $component, Request $request): Response {
    $view = "@oe/$component/$component.twig";
    $parameters = $request->query->all();
    return $this->render($view, $parameters);
  }
}
