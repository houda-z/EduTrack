<?php

namespace App\Http\Controllers\Enseignant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EnseignantController extends Controller
{
   public function index()
{
    return view('dashboard.enseignant');
}
}
