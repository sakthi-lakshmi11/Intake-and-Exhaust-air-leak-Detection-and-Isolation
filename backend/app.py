from flask import Flask, request, jsonify
from flask_cors import CORS

from services.c15_service import (
    run_c15_prediction
)

from services.c7_service import (
    run_c7_prediction
)

from rag_engine import (
    get_recommendation
)

app = Flask(__name__)

CORS(app)

# ==========================================
# HEALTH CHECK
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "status": "running",
        "project": "CAT Air Leak Detection System"
    })


# ==========================================
# PREDICTION API
# ==========================================

@app.route(
    "/api/predict",
    methods=["POST"]
)
def predict():

    try:

        request_data = request.json or {}

        inputs = request_data.get(
            "inputs",
            {}
        )

        engine_model = inputs.get(
            "engineModel",
            "C15"
        )

        print(
            f"\nReceived Request For : "
            f"{engine_model}"
        )

        # -------------------------------
        # MODEL INFERENCE
        # -------------------------------

        if engine_model.upper() == "C15":

            prediction_result = (
                run_c15_prediction()
            )

        elif engine_model.upper() == "C7":

            prediction_result = (
                run_c7_prediction()
            )

        else:

            return jsonify({

                "success": False,

                "message":
                "Invalid engine model"

            }), 400

        # -------------------------------
        # RECOMMENDATION ENGINE
        # -------------------------------

        leak_section = prediction_result.get(
            "leak_section",
            ""
        )

        severity = prediction_result.get(
            "severity",
            ""
        )

        recommendations = get_recommendation(
            leak_section,
            severity
        )

        prediction_result[
            "recommendations"
        ] = recommendations

        # -------------------------------
        # RETURN RESPONSE
        # -------------------------------

        return jsonify({

            "success": True,

            "data":
            prediction_result

        })

    except Exception as e:

        print(
            "\nPrediction Error:",
            str(e)
        )

        return jsonify({

            "success": False,

            "message":
            str(e)

        }), 500


# ==========================================
# TEST API
# ==========================================

@app.route(
    "/api/test",
    methods=["GET"]
)
def test():

    sample = {

        "engine":
        "C15",

        "message":
        "Backend Connected Successfully"

    }

    return jsonify({

        "success": True,

        "result":
        sample

    })


# ==========================================
# C15 QUICK TEST
# ==========================================

@app.route(
    "/api/test-c15",
    methods=["GET"]
)
def test_c15():

    try:

        result = run_c15_prediction()

        recommendations = get_recommendation(
            result.get("leak_section", ""),
            result.get("severity", "")
        )

        result["recommendations"] = (
            recommendations
        )

        return jsonify({

            "success": True,

            "result":
            result

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message":
            str(e)

        })


# ==========================================
# C7 QUICK TEST
# ==========================================

@app.route(
    "/api/test-c7",
    methods=["GET"]
)
def test_c7():

    try:

        result = run_c7_prediction()

        recommendations = get_recommendation(
            result.get("leak_section", ""),
            result.get("severity", "")
        )

        result["recommendations"] = (
            recommendations
        )

        return jsonify({

            "success": True,

            "result":
            result

        })

    except Exception as e:

        return jsonify({

            "success": False,

            "message":
            str(e)

        })


# ==========================================
# MAIN
# ==========================================

if __name__ == "__main__":

    print("\n" + "=" * 60)
    print("CAT AIR LEAK DETECTION SERVER")
    print("=" * 60)

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )