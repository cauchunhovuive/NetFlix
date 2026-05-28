# Databricks notebook source
# Netflix Data Analysis — Phân tích dữ liệu xem phim
# Chạy notebook này trên Databricks Community Edition
# Sau khi upload movies.csv, users.csv, watchhistory.csv lên Volume

# MAGIC %md
# # 🎬 Netflix Data Analysis
# ## Phân tích dữ liệu xem phim với Apache Spark
# 
# **Bước 1:** Upload 3 file CSV lên Databricks Volume
# **Bước 2:** Chạy notebook này

# COMMAND ----------

# MAGIC %md
# ## 1. Load dữ liệu từ Volume

# COMMAND ----------

# Đường dẫn Volume (thay đổi nếu cần)
volume_path = "/Volumes/main/default/data_netflix/"

# Load CSV files
movies_df = spark.read.option("header", "true").option("inferSchema", "true").csv(volume_path + "movies.csv")
users_df = spark.read.option("header", "true").option("inferSchema", "true").csv(volume_path + "users.csv")
watchhistory_df = spark.read.option("header", "true").option("inferSchema", "true").csv(volume_path + "watchhistory.csv")

print(f"✅ Movies: {movies_df.count()} rows")
print(f"✅ Users: {users_df.count()} rows")
print(f"✅ WatchHistory: {watchhistory_df.count()} rows")

# COMMAND ----------

# MAGIC %md
# ## 2. Xem cấu trúc dữ liệu

# COMMAND ----------

print("=== Movies Schema ===")
movies_df.printSchema()
display(movies_df.limit(10))

print("=== Users Schema ===")
users_df.printSchema()
display(users_df.limit(10))

print("=== WatchHistory Schema ===")
watchhistory_df.printSchema()
display(watchhistory_df.limit(10))

# COMMAND ----------

# MAGIC %md
# ## 3. Phân tích phim được xem nhiều nhất

# COMMAND ----------

from pyspark.sql.functions import col, count, avg, sum as spark_sum, round as spark_round, desc

# Top 10 phim được xem nhiều nhất
top_movies = (
    watchhistory_df
    .groupBy("MovieID")
    .agg(
        count("*").alias("ViewCount"),
        spark_round(avg("Rating"), 2).alias("AvgRating"),
        spark_round(avg("WatchTime"), 0).alias("AvgWatchTime")
    )
    .join(movies_df.select("MovieID", "Title", "Genre"), "MovieID")
    .orderBy(desc("ViewCount"))
    .limit(10)
)

print("=== 🎬 Top 10 phim được xem nhiều nhất ===")
display(top_movies)

# COMMAND ----------

# MAGIC %md
# ## 4. Thống kê rating trung bình theo thể loại

# COMMAND ----------

from pyspark.sql.functions import split, explode, trim

# Tách genre (một phim có nhiều thể loại cách nhau bằng dấu phẩy)
movies_with_genres = movies_df.withColumn("GenreArray", split(col("Genre"), ","))
movies_exploded = movies_with_genres.select(
    col("MovieID"),
    col("Title"),
    explode(col("GenreArray")).alias("Genre")
)

# Join với watchhistory để tính rating theo thể loại
genre_ratings = (
    watchhistory_df
    .join(movies_exploded, "MovieID")
    .groupBy("Genre")
    .agg(
        spark_round(avg("Rating"), 2).alias("AvgRating"),
        count("*").alias("ViewCount"),
        spark_round(avg("WatchTime"), 0).alias("AvgWatchTime")
    )
    .orderBy(desc("AvgRating"))
)

print("=== 📊 Rating trung bình theo thể loại ===")
display(genre_ratings)

# COMMAND ----------

# MAGIC %md
# ## 5. Top người dùng xem nhiều nhất

# COMMAND ----------

top_users = (
    watchhistory_df
    .groupBy("UserID")
    .agg(
        count("*").alias("TotalViews"),
        spark_round(avg("Rating"), 2).alias("AvgRating"),
        spark_sum("WatchTime").alias("TotalWatchTime")
    )
    .join(users_df.select("UserID", "Name", "Email"), "UserID")
    .orderBy(desc("TotalViews"))
    .limit(10)
)

print("=== 👤 Top 10 người dùng xem nhiều nhất ===")
display(top_users)

# COMMAND ----------

# MAGIC %md
# ## 6. Thống kê theo thời gian (lượt xem theo ngày)

# COMMAND ----------

from pyspark.sql.functions import to_date

# Phân tích lượt xem theo ngày
daily_views = (
    watchhistory_df
    .withColumn("WatchDate", to_date(col("CreatedAt")))
    .groupBy("WatchDate")
    .agg(
        count("*").alias("ViewCount"),
        spark_round(avg("Rating"), 2).alias("AvgRating")
    )
    .orderBy("WatchDate")
)

print("=== 📅 Lượt xem theo ngày ===")
display(daily_views)

# COMMAND ----------

# MAGIC %md
# ## 7. Biểu đồ trực quan — Top phim (Matplotlib)

# COMMAND ----------

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Convert to Pandas for visualization
top_movies_pd = top_movies.toPandas()

# Bar chart — Top 10 phim
plt.figure(figsize=(14, 7))
colors = plt.cm.Reds(np.linspace(0.3, 0.9, len(top_movies_pd)))
bars = plt.barh(top_movies_pd["Title"], top_movies_pd["ViewCount"], color=colors)
plt.xlabel("Lượt xem", fontsize=12)
plt.ylabel("Phim", fontsize=12)
plt.title("🎬 Top 10 phim được xem nhiều nhất", fontsize=16, fontweight="bold")
plt.gca().invert_yaxis()

# Add value labels
for bar, count, rating in zip(bars, top_movies_pd["ViewCount"], top_movies_pd["AvgRating"]):
    plt.text(bar.get_width() + 0.3, bar.get_y() + bar.get_height()/2,
             f"{int(count)} lượt — ⭐ {rating}", va="center", fontsize=10)

plt.tight_layout()
plt.show()

# COMMAND ----------

# MAGIC %md
# ## 8. Biểu đồ — Rating theo thể loại

# COMMAND ----------

genre_ratings_pd = genre_ratings.toPandas()

plt.figure(figsize=(14, 6))
colors = plt.cm.viridis(np.linspace(0.2, 0.9, len(genre_ratings_pd)))
bars = plt.bar(genre_ratings_pd["Genre"], genre_ratings_pd["AvgRating"], color=colors)
plt.xlabel("Thể loại", fontsize=12)
plt.ylabel("Rating trung bình", fontsize=12)
plt.title("⭐ Rating trung bình theo thể loại", fontsize=16, fontweight="bold")
plt.xticks(rotation=45, ha="right")

for bar, rating, count in zip(bars, genre_ratings_pd["AvgRating"], genre_ratings_pd["ViewCount"]):
    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.05,
             f"{rating} ({int(count)})", ha="center", fontsize=9)

plt.tight_layout()
plt.show()

# COMMAND ----------

# MAGIC %md
# ## 9. Biểu đồ — Xu hướng xem theo thời gian

# COMMAND ----------

daily_views_pd = daily_views.toPandas()

plt.figure(figsize=(14, 5))
plt.plot(pd.to_datetime(daily_views_pd["WatchDate"]), daily_views_pd["ViewCount"],
         marker="o", linestyle="-", color="#e50914", linewidth=2, markersize=6)
plt.xlabel("Ngày", fontsize=12)
plt.ylabel("Lượt xem", fontsize=12)
plt.title("📈 Xu hướng lượt xem theo thời gian", fontsize=16, fontweight="bold")
plt.grid(axis="y", alpha=0.3)
plt.tight_layout()
plt.show()

# COMMAND ----------

# MAGIC %md
# ## 10. Lưu kết quả vào Delta Lake Tables

# COMMAND ----------

# Lưu top movies vào Delta table
top_movies.write.mode("overwrite").saveAsTable("netflix_analysis_top_movies")
print("✅ Đã lưu: netflix_analysis_top_movies")

# Lưu genre ratings vào Delta table
genre_ratings.write.mode("overwrite").saveAsTable("netflix_analysis_genre_ratings")
print("✅ Đã lưu: netflix_analysis_genre_ratings")

# Lưu daily views vào Delta table
daily_views.write.mode("overwrite").saveAsTable("netflix_analysis_daily_views")
print("✅ Đã lưu: netflix_analysis_daily_views")

# COMMAND ----------

# MAGIC %md
# ## ✅ Hoàn tất!
# 
# Kết quả phân tích đã được lưu vào Delta Lake Tables:
# - `netflix_analysis_top_movies` — Top phim được xem nhiều
# - `netflix_analysis_genre_ratings` — Rating trung bình theo thể loại
# - `netflix_analysis_daily_views` — Xu hướng xem theo ngày
