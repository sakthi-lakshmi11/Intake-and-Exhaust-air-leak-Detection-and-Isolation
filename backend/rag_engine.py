# backend/rag_engine.py

class RAGEngine:

    def __init__(self):

        # =========================
        # C15 MAPPING NORMALIZATION
        # =========================

        self.c15_map = {
            "Air Filter -> MAF Sensor": "Air Filter to MAF Sensor",
            "MAF Sensor -> Turbo Compressor Inlet": "MAF Sensor to Turbo Compressor Inlet",
            "Compressor Outlet -> Charge Air Cooler": "Turbo Compressor Outlet to Charge Air Cooler",
            "CAC -> Intake Manifold -> Cylinder": "CAC to Intake Manifold",
            "Cylinder -> Turbine Inlet": "Cylinder to Turbine Inlet",
            "Diesel Oxidation Catalyst": "DOC",
            "Diesel Particulate Filter": "DPF",
            "Selective Catalytic Reduction": "SCR"
        }

        # =========================
        # SEVERITY NORMALIZATION
        # =========================

        self.severity_map = {
            "Low Severity Leak": "Low Leak",
            "Medium Severity Leak": "Medium Leak",
            "Moderate Severity Leak": "Medium Leak",
            "High Severity Leak": "High Leak",
            "No Leak Detected": "Healthy",
            "No Leak": "Healthy"
        }

        # =========================
        # PDF KNOWLEDGE BASE
        # =========================

        self.recommendations = {

            # 1. Air Filter to MAF
            ("Air Filter to MAF Sensor", "Low Leak"): [
                "Inspect air filter element for light dust loading.",
                "Verify filter housing lid is seated correctly.",
                "Continue test and schedule inspection during next planned stop.",
                "Continue testing with monitoring enabled.",
                "Log deviation as early warning event."
            ],

            ("Air Filter to MAF Sensor", "Medium Leak"): [
                "Inspect air filter element for heavy dust or moisture.",
                "Check housing seal and intake bellows for cracks or loose clips.",
                "Verify if the service indicator has tripped.",
                "Complete current test cycle.",
                "Schedule corrective action before next test phase."
            ],

            ("Air Filter to MAF Sensor", "High Leak"): [
                "Stop test immediately.",
                "Replace air filter element if contaminated or wet.",
                "Repair or replace cracked housing / bellows.",
                "Re-baseline MAF and Delta-P values before restart.",
                "Suspend performance testing immediately and rectify leak."
            ],

            # 2. MAF to Turbo
            ("MAF Sensor to Turbo Compressor Inlet", "Low Leak"): [
                "Monitor turbo inlet pressure trend.",
                "Inspect hose clamps during scheduled downtime.",
                "Test may continue.",
                "Log deviation as early warning event."
            ],

            ("MAF Sensor to Turbo Compressor Inlet", "Medium Leak"): [
                "Inspect flexible hose for softening, collapse, or tears.",
                "Check clamp torque to prevent unmetered air entry.",
                "Inspect turbo inlet mesh for debris.",
                "Complete current test cycle.",
                "Schedule corrective action before next test phase."
            ],

            ("MAF Sensor to Turbo Compressor Inlet", "High Leak"): [
                "Stop test immediately.",
                "Replace inlet hose assembly.",
                "Verify turbo inlet pressure stability.",
                "Re-run baseline before resuming test cycle.",
                "Suspend testing immediately and rectify leak."
            ],

            # 3. Turbo Outlet to CAC
            ("Turbo Compressor Outlet to Charge Air Cooler", "Low Leak"): [
                "Log pressure and temperature deviation.",
                "Inspect boots during engine cooldown.",
                "Continue test with monitoring.",
                "Continue testing with monitoring enabled.",
                "Log deviation as early warning event."
            ],

            ("Turbo Compressor Outlet to Charge Air Cooler", "Medium Leak"): [
                "Inspect silicone boots for ballooning or pinhole leaks.",
                "Check turbo outlet V-band clamp alignment.",
                "Listen for whistling noise during acceleration.",
                "Complete current test cycle.",
                "Schedule corrective action before next test phase."
            ],

            ("Turbo Compressor Outlet to Charge Air Cooler", "High Leak"): [
                "Stop test immediately.",
                "Replace damaged boots or clamps.",
                "Pressure test charge-air system.",
                "Validate boost pressure before restart.",
                "Suspend performance testing immediately and rectify leak."
            ],

            # 4. CAC to Intake
            ("CAC to Intake Manifold", "Low Leak"): [
                "Monitor MAP/MAT trends.",
                "Inspect during next maintenance window.",
                "Test may proceed.",
                "Log deviation as early warning event."
            ],

            ("CAC to Intake Manifold", "Medium Leak"): [
                "Perform smoke test on CAC core.",
                "Inspect intake manifold gasket and O-rings.",
                "Check MAT sensor for oil fouling.",
                "Complete current test cycle.",
                "Schedule corrective action before next test phase."
            ],

            ("CAC to Intake Manifold", "High Leak"): [
                "Immediate shutdown.",
                "Repair or replace CAC or manifold seals.",
                "Clean or replace fouled sensors.",
                "Revalidate intake pressure baseline.",
                "Suspend performance testing immediately and rectify leak."
            ],

            # 5. Cylinder to Turbine
            ("Cylinder to Turbine Inlet", "Low Leak"): [
                "Monitor EGT and turbo speed.",
                "Continue testing with caution.",
                "Log deviation as early warning event."
            ],

            ("Cylinder to Turbine Inlet", "Medium Leak"): [
                "Inspect exhaust manifold gaskets for soot ghosting.",
                "Check for heat cracks near center cylinders.",
                "Retorque manifold fasteners.",
                "Complete current test cycle.",
                "Schedule corrective action before next test phase."
            ],

            ("Cylinder to Turbine Inlet", "High Leak"): [
                "Stop test immediately.",
                "Replace cracked manifold or failed gasket.",
                "Inspect nearby components for heat damage.",
                "Restart only after full exhaust integrity check.",
                "Suspend performance testing immediately and rectify leak."
            ],

            # 6. DOC / DPF / SCR (simplified)
            ("DOC", "Low Leak"): [
                "Continue test; emissions trend deviation logged.",
                "Log deviation as early warning event."
            ],

            ("DOC", "High Leak"): [
                "Stop test; repair flange to prevent catalyst damage.",
                "Suspend emissions testing immediately.",
                "Revalidate baseline before resuming."
            ],

            ("DPF", "High Leak"): [
                "Immediate repair required; incorrect soot loading risk.",
                "Suspend testing and inspect system integrity.",
                "Revalidate DPF pressure baseline."
            ],

            ("SCR", "High Leak"): [
                "Stop test; visible crystallization indicates severe leak.",
                "Inspect DEF injector seal.",
                "Suspend emissions testing immediately.",
                "Revalidate NOx baseline."
            ]
        }

    # =========================
    # NORMALIZATION FUNCTION
    # =========================

    def normalize(self, section, severity):

        section = self.c15_map.get(section, section)
        severity = self.severity_map.get(severity, severity)

        return section, severity

    # =========================
    # MAIN RAG FUNCTION
    # =========================

    def get_recommendation(self, section, severity):

        section, severity = self.normalize(section, severity)

        key = (section, severity)

        if key in self.recommendations:
            return self.recommendations[key]

        # fallback safety system recommendation
        return [
            "Monitor system parameters closely.",
            "Log anomaly for engineering review.",
            "Complete current test cycle safely.",
            "Schedule inspection during maintenance window.",
            "Suspend testing if deviation increases."
        ]


# =========================
# GLOBAL INSTANCE
# =========================

rag_engine = RAGEngine()


def get_recommendation(section, severity):
    return rag_engine.get_recommendation(section, severity)