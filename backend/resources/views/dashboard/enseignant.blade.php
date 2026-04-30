<!DOCTYPE html>
<html>
<head><title>Dashboard Enseignant</title></head>
<body>
    <h1>Bienvenue {{ auth()->user()->name }} 👋</h1>
    <p>Rôle : {{ auth()->user()->role }}</p>
    <form method="POST" action="/logout">
        @csrf
        <button type="submit">Se déconnecter</button>
    </form>
</body>
</html>