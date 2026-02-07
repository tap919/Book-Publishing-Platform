/**
 * Recommendation Engine Service
 * Provides personalized book recommendations
 */
class RecommendationService {
  /**
   * Get recommendations based on user's reading history
   */
  async getPersonalizedRecommendations(userId, userInteractions, allBooks) {
    // Collaborative filtering approach
    const userGenres = this.extractUserGenres(userInteractions);
    const recommendations = [];

    for (const book of allBooks) {
      const score = this.calculateRecommendationScore(book, userGenres, userInteractions);
      if (score > 0.3) {
        recommendations.push({
          ...book,
          recommendationScore: score,
        });
      }
    }

    // Sort by score and return top 20
    return recommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 20);
  }

  /**
   * Extract user's preferred genres from interaction history
   */
  extractUserGenres(interactions) {
    const genreCounts = {};
    
    for (const interaction of interactions) {
      const genre = interaction.book_genre;
      if (genre) {
        genreCounts[genre] = (genreCounts[genre] || 0) + this.getInteractionWeight(interaction.interaction_type);
      }
    }

    return genreCounts;
  }

  /**
   * Get weight for different interaction types
   */
  getInteractionWeight(interactionType) {
    const weights = {
      purchase: 5,
      review: 4,
      favorite: 3,
      view: 1,
    };
    return weights[interactionType] || 1;
  }

  /**
   * Calculate recommendation score for a book
   */
  calculateRecommendationScore(book, userGenres, userInteractions) {
    let score = 0;

    // Genre matching
    if (userGenres[book.genre]) {
      score += 0.4 * (userGenres[book.genre] / 10); // Normalize
    }

    // Popularity factor (based on sales/reviews)
    const popularityScore = Math.min((book.reviewCount || 0) / 100, 1);
    score += 0.2 * popularityScore;

    // Rating quality
    if (book.averageRating) {
      score += 0.3 * (book.averageRating / 5);
    }

    // Recency bonus
    const daysOld = (Date.now() - new Date(book.published_at)) / (1000 * 60 * 60 * 24);
    if (daysOld < 90) {
      score += 0.1; // New releases bonus
    }

    return Math.min(score, 1);
  }

  /**
   * Get trending books
   */
  async getTrendingBooks(books, recentInteractions) {
    const trendingScores = {};

    // Count interactions in last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    for (const interaction of recentInteractions) {
      if (new Date(interaction.created_at) > weekAgo) {
        const bookId = interaction.book_id;
        trendingScores[bookId] = (trendingScores[bookId] || 0) + 
          this.getInteractionWeight(interaction.interaction_type);
      }
    }

    // Sort books by trending score
    return books
      .map(book => ({
        ...book,
        trendingScore: trendingScores[book.id] || 0,
      }))
      .filter(book => book.trendingScore > 0)
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 20);
  }

  /**
   * Get similar books based on content
   */
  getSimilarBooks(targetBook, allBooks) {
    return allBooks
      .filter(book => book.id !== targetBook.id)
      .map(book => ({
        ...book,
        similarityScore: this.calculateSimilarity(targetBook, book),
      }))
      .filter(book => book.similarityScore > 0.3)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 10);
  }

  /**
   * Calculate similarity between two books
   */
  calculateSimilarity(book1, book2) {
    let score = 0;

    // Genre match
    if (book1.genre === book2.genre) {
      score += 0.5;
    }

    // Author match (same author's other books)
    if (book1.author_id === book2.author_id) {
      score += 0.3;
    }

    // Similar keywords (simplified)
    const keywords1 = book1.keywords || [];
    const keywords2 = book2.keywords || [];
    const commonKeywords = keywords1.filter(k => keywords2.includes(k)).length;
    if (commonKeywords > 0) {
      score += 0.2 * Math.min(commonKeywords / 5, 1);
    }

    return Math.min(score, 1);
  }

  /**
   * Get books by community curation (highly rated, frequently reviewed)
   */
  getCuratedBooks(books) {
    return books
      .filter(book => book.reviewCount >= 5 && book.averageRating >= 4.0)
      .sort((a, b) => {
        // Sort by rating first, then review count
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 20);
  }
}

module.exports = new RecommendationService();
