import os
from flask import Flask, render_template, request, redirect, url_for, session, flash

app = Flask(__name__, template_folder="templates")
app.secret_key = os.environ.get("SECRET_KEY", "scholarhub_super_secret_key_2026")

# Step 1: Login / Register Page (Website Entry Point)
@app.route("/")
@app.route("/login", methods=["GET", "POST"])
def login():
    if session.get("user_id"):
        return redirect(url_for("landing"))

    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        if email and password:
            session["user_id"] = "user_123"
            session["user_email"] = email
            flash("Successfully logged in!", "success")
            # Step 1 -> Step 2
            return redirect(url_for("landing"))
        else:
            flash("Please provide both email and password.", "error")

    return render_template("landing.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if session.get("user_id"):
        return redirect(url_for("landing"))

    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        name = request.form.get("name", "")
        if email and password:
            session["user_id"] = "user_123"
            session["user_email"] = email
            session["user_name"] = name
            flash("Account created successfully!", "success")
            # Step 1 -> Step 2
            return redirect(url_for("landing"))
        else:
            flash("Please fill in all required fields.", "error")

    return render_template("landing.html")

# Step 2: Landing Page (accessible after login/register)
@app.route("/landing")
def landing():
    if not session.get("user_id"):
        flash("Please log in to access ScholarHub.", "error")
        return redirect(url_for("login"))
    return render_template("landing.html")

@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))

# Step 3: Dashboard Page
@app.route("/dashboard")
def dashboard():
    if not session.get("user_id"):
        flash("Please log in to access your dashboard.", "error")
        return redirect(url_for("login"))
    
    search_query = request.args.get("q", "")
    user_name = session.get("user_name", session.get("user_email"))
    return f"<h1>ScholarHub Dashboard</h1><p>Welcome, {user_name}!</p><p>Search query: {search_query}</p><a href='/landing'>Landing Page</a> | <a href='/logout'>Log Out</a>"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
