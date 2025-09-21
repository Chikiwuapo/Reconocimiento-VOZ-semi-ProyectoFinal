try:
    import pymysql
    pymysql.install_as_MySQLdb()
except Exception:
    # Safe to ignore if PyMySQL isn't available during certain tooling steps
    pass
