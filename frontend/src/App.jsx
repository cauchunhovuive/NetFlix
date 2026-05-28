import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { getUserId, getMovieId, getTitle } from "./api";
import { useAuth } from "./hooks/useAuth";
import { useMovies } from "./hooks/useMovies";
import { useWallet } from "./hooks/useWallet";
import { useVouchers } from "./hooks/useVouchers";
import { useProfile } from "./hooks/useProfile";
import { useChat } from "./hooks/useChat";
import { useAdmin } from "./hooks/useAdmin";
import { useFavorites } from "./hooks/useFavorites";
import { useReviews } from "./hooks/useReviews";
import { useTheme } from "./hooks/useTheme";

import AuthPage from "./pages/AuthPage";
import MoviesTab from "./pages/MoviesTab";
import HistoryTab from "./pages/HistoryTab";
import WalletTab from "./pages/WalletTab";
import ProfileTab from "./pages/ProfileTab";
import VouchersTab from "./pages/VouchersTab";
import AdminTab from "./pages/AdminTab";
import MovieModal from "./modals/MovieModal";
import TopUpModal from "./modals/TopUpModal";
import SupportChat from "./chat/SupportChat";
import PlayerOverlay from "./components/PlayerOverlay";
import RippleButton from "./components/RippleButton";
import ToastContainer from "./components/ToastContainer";

export default function App() {
  const auth = useAuth();
  const movies = useMovies();
  const wallet = useWallet();
  const vouchers = useVouchers();
  const profile = useProfile(auth.user);
  const chat = useChat();
  const admin = useAdmin();
  const favorites = useFavorites();
  const reviews = useReviews();
  const theme = useTheme();

  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const { user, page } = auth;
  const [tab, setTab] = useState("movies");
  const [prevTab, setPrevTab] = useState(null);
  const [tabAnimating, setTabAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function switchTab(newTab) {
    if (newTab === tab) return;
    setTabAnimating(true);
    setPrevTab(tab);
    searchQuery && setSearchQuery("");
    setTimeout(() => {
      setTab(newTab);
      setTabAnimating(false);
    }, 200);
  }

  // Page load — fetch data
  useEffect(() => {
    if (page === "main") {
      movies.fetchMovies();
      movies.fetchHistory();
      favorites.fetchFavorites(user);
      if (user?.Role === "Admin") {
        admin.fetchAdminUsers();
        admin.fetchAdminVouchers();
        admin.fetchAdminConvs();
        admin.fetchAdminTransactions();
      }
      vouchers.fetchVouchers();
      if (user?.Role !== "Admin") {
        wallet.fetchWallet(user);
        wallet.fetchTransactions(user);
        wallet.fetchPurchasedMovies(user);
      }
      setTimeout(() => movies.setCardsVisible(true), 400);
    }
  }, [page]);

  // ===== Keyboard shortcuts =====
  useEffect(() => {
    function handleKeyDown(e) {
      // Escape: close active overlay
      if (e.key === "Escape") {
        if (movies.playerOpen) {
          movies.setPlayerOpen(false);
          return;
        }
        if (movies.modalState !== "closed") {
          movies.closeModal();
          return;
        }
        if (wallet.showTopUp) {
          wallet.setShowTopUp(false);
          wallet.setTopUpMsg({ text: "", type: "" });
          return;
        }
        if (chat.chatOpen) {
          chat.setChatOpen(false);
          return;
        }
      }

      // Arrow keys: hero banner navigation (only when on movies tab and no modal open)
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") &&
          tab === "movies" && movies.modalState === "closed") {
        e.preventDefault();
        const maxIndex = Math.min(movies.movies.length, 5) - 1;
        if (maxIndex <= 0) return;
        const next = e.key === "ArrowRight"
          ? Math.min(movies.heroIndex + 1, maxIndex)
          : Math.max(movies.heroIndex - 1, 0);
        movies.setHeroIndex(next);
        movies.setHeroMovie(movies.movies[next]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movies.playerOpen, movies.modalState, wallet.showTopUp, chat.chatOpen, tab, movies.heroIndex, movies.movies]);

  // Refresh admin stats when switching to dashboard tab
  useEffect(() => {
    if (page === "main" && user?.Role === "Admin" && admin.adminTab === "dashboard") {
      admin.fetchAdminStats();
    }
  }, [admin.adminTab, page]);

  function doLogout() {
    auth.setPageVisible(false);
    setTimeout(() => {
      auth.setUser(null);
      auth.setPage("auth");
      auth.setLoginForm({ email: "", password: "" });
      auth.setRegisterForm({ name: "", email: "", password: "" });
      auth.setAuthMsg({ text: "", type: "" });
      movies.resetMovies();
      vouchers.resetVouchers();
      admin.resetAdmin();
      profile.resetProfile();
      wallet.resetWallet();
      favorites.resetFavorites();
      reviews.resetReviews();
      auth.setAuthTab("login");
    }, 300);
  }

  // Derived data — split combined genres like "Action, Sci-Fi" into separate items
  const rawGenres = movies.movies.map((m) => m.Genre).filter(Boolean);
  const genres = ["Tất cả", ...new Set(rawGenres.flatMap((g) => g.split(",").map((s) => s.trim())))];
  const filteredMovies =
    movies.selectedGenre === "Tất cả"
      ? movies.movies
      : movies.movies.filter((m) => m.Genre?.includes(movies.selectedGenre));

  const avgRating = movies.history.length
    ? (movies.history.reduce((s, r) => s + (r.Rating || 0), 0) / movies.history.length).toFixed(1)
    : "—";
  const totalMins = movies.history.reduce((s, r) => s + (r.WatchTime || 0), 0);

  const currentUserId = getUserId(user);
  const myHistory = movies.history.filter((h) => {
    const hUID = getUserId(h);
    if (hUID === null || currentUserId === null) return false;
    return Number(hUID) === Number(currentUserId);
  });

  const myWatchedCount = new Set(myHistory.map((h) => getMovieId(h))).size;
  const myTotalMins = myHistory.reduce(
    (s, r) => s + (r.WatchTime ?? r.watchTime ?? r.watch_time ?? 0),
    0
  );

  const movieWatchMap = {};
  myHistory.forEach((h) => {
    const title = getTitle(h);
    if (!movieWatchMap[title]) movieWatchMap[title] = { time: 0, rating: 0, count: 0 };
    movieWatchMap[title].time += h.WatchTime ?? h.watchTime ?? h.watch_time ?? 0;
    movieWatchMap[title].rating += h.Rating ?? h.rating ?? 0;
    movieWatchMap[title].count += 1;
  });
  const topMovies = Object.entries(movieWatchMap)
    .sort((a, b) => b[1].time - a[1].time)
    .slice(0, 5)
    .map(([title, v]) => ({
      title,
      time: v.time,
      rating: v.count > 0 ? (v.rating / v.count).toFixed(1) : "—",
    }));

  // Auth page
  if (page === "auth") {
    return (
      <AuthPage
        pageVisible={auth.pageVisible}
        authTab={auth.authTab}
        loginForm={auth.loginForm}
        registerForm={auth.registerForm}
        authMsg={auth.authMsg}
        showPassword={auth.showPassword}
        showRegPassword={auth.showRegPassword}
        authLoading={auth.authLoading}
        formAnimDir={auth.formAnimDir}
        cardRef={auth.cardRef}
        mousePos={auth.mousePos}
        onSetMousePos={auth.setMousePos}
        onSwitchAuthTab={auth.switchAuthTab}
        onSetLoginForm={auth.setLoginForm}
        onSetRegisterForm={auth.setRegisterForm}
        onSetShowPassword={auth.setShowPassword}
        onSetShowRegPassword={auth.setShowRegPassword}
        onLogin={auth.doLogin}
        onRegister={auth.doRegister}
      />
    );
  }

  // Main app
  return (
    <div className={`main-bg ${auth.pageVisible ? "page-visible" : "page-hidden"}`}>
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />

      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-n">N</span>ETFLIX
        </div>
        <nav className="nav">
          {[
            { key: "movies", label: "Phim", icon: "🎬" },
            { key: "history", label: "Lịch sử", icon: "📋" },
            { key: "vouchers", label: "Voucher", icon: "🏷️" },
            ...(user?.Role !== "Admin"
              ? [{ key: "wallet", label: "Ví", icon: "💰" }]
              : []),
            { key: "profile", label: "Tài khoản", icon: "👤" },
            ...(user?.Role === "Admin"
              ? [{ key: "admin", label: "Admin", icon: "⚙️" }]
              : []),
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              className={tab === key ? "nav-btn active" : "nav-btn"}
              onClick={() => switchTab(key)}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
              {tab === key && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="header-right">
          {/* Theme picker */}
          <div className="theme-picker-wrap">
            <button
              className="theme-toggle-btn"
              onClick={() => theme.setShowThemePicker(!theme.showThemePicker)}
              title="Đổi giao diện"
            >
              🎨
            </button>
            {theme.showThemePicker && (
              <div className="theme-picker-dropdown">
                <div className="theme-picker-title">Chọn giao diện</div>
                {theme.themeList.map((t) => (
                  <button
                    key={t.key}
                    className={`theme-option ${t.isActive ? "active" : ""}`}
                    onClick={() => { theme.applyTheme(t.key); theme.setShowThemePicker(false); }}
                  >
                    <span className="theme-option-icon">{t.icon}</span>
                    <span className="theme-option-name">{t.name}</span>
                    {t.isActive && <span className="theme-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user?.Role !== "Admin" && (
            <div
              className="wallet-badge"
              onClick={() => wallet.setShowTopUp(true)}
              title="Nạp tiền"
            >
              <span>💰</span>
              <span className="wallet-badge-amount">
                ${parseFloat(wallet.walletBalance).toFixed(2)}
              </span>
            </div>
          )}
          <div className="user-avatar">
            <span>{(user?.Name || "U").slice(0, 2).toUpperCase()}</span>
            <div className="avatar-ring" />
          </div>
          <span className="user-name">{user?.Name}</span>
          <RippleButton className="btn-logout" onClick={doLogout}>
            Đăng xuất
          </RippleButton>
        </div>
      </header>

      {/* Tab content */}
      <div className={`tab-content ${tabAnimating ? "tab-exit" : "tab-enter"}`}>
        {tab === "movies" && (
          <MoviesTab
            movies={movies.movies}
            loadingMovies={movies.loadingMovies}
            cardsVisible={movies.cardsVisible}
            selectedGenre={movies.selectedGenre}
            filteredMovies={filteredMovies}
            genres={genres}
            heroMovie={movies.heroMovie}
            heroIndex={movies.heroIndex}
            purchasedIds={wallet.purchasedIds}
            favoriteIds={favorites.favoriteIds}
            searchQuery={searchQuery}
            onSetSearchQuery={setSearchQuery}
            onSetSelectedGenre={movies.setSelectedGenre}
            onOpenMovie={movies.openMovie}
            onSetHeroIndex={movies.setHeroIndex}
            onToggleFavorite={(movieId) => favorites.toggleFavorite(movieId, user)}
            user={user}
          />
        )}

        {tab === "history" && (
          <HistoryTab
            history={movies.history}
            loadingHistory={movies.loadingHistory}
            avgRating={avgRating}
            totalMins={totalMins}
          />
        )}

        {tab === "wallet" && (
          <WalletTab
            walletBalance={wallet.walletBalance}
            transactions={wallet.transactions}
            loadingTransactions={wallet.loadingTransactions}
            purchasedMovies={wallet.purchasedMovies}
            walletTab={wallet.walletTab}
            purchaseLoading={wallet.purchaseLoading}
            onSetWalletTab={wallet.setWalletTab}
            onSetShowTopUp={wallet.setShowTopUp}
            onPurchaseMovie={(movieId) =>
              wallet.doPurchaseMovie(
                movieId,
                user,
                wallet.fetchPurchasedMovies,
                wallet.fetchTransactions,
                addToast
              )
            }
          />
        )}

        {tab === "profile" && (
          <ProfileTab
            user={user}
            editForm={profile.editForm}
            passwordForm={profile.passwordForm}
            editMsg={profile.editMsg}
            editingPassword={profile.editingPassword}
            editLoading={profile.editLoading}
            myWatchedCount={myWatchedCount}
            myHistory={myHistory}
            myTotalMins={myTotalMins}
            topMovies={topMovies}
            onSetEditForm={profile.setEditForm}
            onSetPasswordForm={profile.setPasswordForm}
            onUpdateProfile={(e) => profile.doUpdateProfile(e, auth.setUser)}
            onChangePassword={profile.doChangePassword}
            onSetEditingPassword={profile.setEditingPassword}
          />
        )}

        {tab === "vouchers" && (
          <VouchersTab
            vouchers={vouchers.vouchers}
            loadingVouchers={vouchers.loadingVouchers}
            redeemCode={vouchers.redeemCode}
            redeemMsg={vouchers.redeemMsg}
            redeemLoading={vouchers.redeemLoading}
            onSetRedeemCode={vouchers.setRedeemCode}
            onRedeem={vouchers.doRedeem}
          />
        )}

        {tab === "admin" && (
          <AdminTab
            user={user}
            adminTab={admin.adminTab}
            adminStats={admin.adminStats}
            adminStatsLoading={admin.adminStatsLoading}
            adminMsg={admin.adminMsg}
            adminLoading={admin.adminLoading}
            adminUsers={admin.adminUsers}
            movies={movies.movies}
            adminVouchers={admin.adminVouchers}
            adminMovieForm={admin.adminMovieForm}
            adminEditingMovie={admin.adminEditingMovie}
            adminShowMovieForm={admin.adminShowMovieForm}
            adminVoucherForm={admin.adminVoucherForm}
            adminEditingVoucher={admin.adminEditingVoucher}
            adminShowVoucherForm={admin.adminShowVoucherForm}
            adminConv={admin.adminConv}
            adminConvLoading={admin.adminConvLoading}
            adminTransactions={admin.adminTransactions}
            adminTransactionsLoading={admin.adminTransactionsLoading}
            adminConvMessages={admin.adminConvMessages}
            adminConvUserId={admin.adminConvUserId}
            adminReplyText={admin.adminReplyText}
            adminReplySending={admin.adminReplySending}
            onSetAdminTab={admin.setAdminTab}
            onSetAdminMsg={admin.setAdminMsg}
            onSaveMovie={(e) => admin.doSaveMovie(e, movies.fetchMovies)}
            onDeleteMovie={(id) => admin.doDeleteMovie(id, movies.fetchMovies)}
            onOpenEditMovie={admin.openEditMovie}
            onSetAdminMovieForm={admin.setAdminMovieForm}
            onSetAdminShowMovieForm={admin.setAdminShowMovieForm}
            onSetAdminEditingMovie={admin.setAdminEditingMovie}
            onSaveVoucher={admin.doSaveVoucher}
            onDeleteVoucher={admin.doDeleteVoucher}
            onOpenEditVoucher={admin.openEditVoucher}
            onSetAdminVoucherForm={admin.setAdminVoucherForm}
            onSetAdminShowVoucherForm={admin.setAdminShowVoucherForm}
            onSetAdminEditingVoucher={admin.setAdminEditingVoucher}
            onFetchAdminConvs={admin.fetchAdminConvs}
            onOpenAdminConv={admin.openAdminConv}
            onAdminReply={admin.doAdminReply}
            onSetAdminReplyText={admin.setAdminReplyText}
            onSetAdminConvUserId={admin.setAdminConvUserId}
            onSetAdminConvMessages={admin.setAdminConvMessages}
          />
        )}
      </div>

      {/* Movie modal */}
      <MovieModal
        modalState={movies.modalState}
        selectedMovie={movies.selectedMovie}
        streamUrl={movies.streamUrl}
        streamMsg={movies.streamMsg}
        streamLoading={movies.streamLoading}
        omdbData={movies.omdbData}
        watchForm={movies.watchForm}
        watchMsg={movies.watchMsg}
        purchaseLoading={wallet.purchaseLoading}
        purchasedIds={wallet.purchasedIds}
        onCloseModal={movies.closeModal}
        onWatchMovie={movies.doWatchMovie}
        onWatch={() => movies.doWatch(user, movies.closeModal, movies.fetchHistory)}
        onSetWatchForm={movies.setWatchForm}
        onPurchaseMovie={(movieId) =>
          wallet.doPurchaseMovie(
            movieId,
            user,
            wallet.fetchPurchasedMovies,
            wallet.fetchTransactions,
            addToast
          )
        }
        onSetPlayerOpen={movies.setPlayerOpen}
        // New props for favorites + reviews
        favoriteIds={favorites.favoriteIds}
        onToggleFavorite={(movieId) => favorites.toggleFavorite(movieId, user)}
        user={user}
        reviews={reviews.reviews}
        reviewsLoading={reviews.reviewsLoading}
        reviewMsg={reviews.reviewMsg}
        onFetchReviews={reviews.fetchReviews}
        onSubmitReview={reviews.submitReview}
      />

      {/* Top-up modal */}
      <TopUpModal
        showTopUp={wallet.showTopUp}
        walletBalance={wallet.walletBalance}
        topUpAmount={wallet.topUpAmount}
        topUpVoucher={wallet.topUpVoucher}
        topUpLoading={wallet.topUpLoading}
        topUpMsg={wallet.topUpMsg}
        onSetShowTopUp={wallet.setShowTopUp}
        onSetTopUpAmount={wallet.setTopUpAmount}
        onSetTopUpVoucher={wallet.setTopUpVoucher}
        onSetTopUpMsg={wallet.setTopUpMsg}
        onTopUp={(e) => wallet.doTopUp(e, user, wallet.fetchTransactions)}
      />

      {/* Support Chat */}
      <SupportChat
        user={user}
        chatOpen={chat.chatOpen}
        chatMessages={chat.chatMessages}
        chatLoading={chat.chatLoading}
        chatText={chat.chatText}
        chatSending={chat.chatSending}
        onSetChatOpen={chat.setChatOpen}
        onFetchChatMessages={() => chat.fetchChatMessages(user)}
        onSetChatText={chat.setChatText}
        onSendChat={() => chat.doSendChat(user)}
      />

      {/* Player overlay */}
      <PlayerOverlay
        playerOpen={movies.playerOpen}
        selectedMovie={movies.selectedMovie}
        onClose={() => movies.setPlayerOpen(false)}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Keyboard shortcut hint */}
      {tab === "movies" && movies.modalState === "closed" && !movies.playerOpen && (
        <div className="kbd-hint">
          <span className="kbd-hint-item">
            <kbd>←</kbd> <kbd>→</kbd> Điều hướng phim
          </span>
          <span className="kbd-hint-sep" />
          <span className="kbd-hint-item">
            <kbd>Esc</kbd> Đóng
          </span>
        </div>
      )}
    </div>
  );
}
