from flask import Flask, redirect

app = Flask(__name__, static_folder="../frontend", static_url_path="")


@app.get("/")
def home():
    return redirect("/pages/index.html")


if __name__ == "__main__":
    app.run(debug=True)
