Rails.application.routes.draw do
  # ----- 通常の HTML ルート -----
  resources :cards

  resources :folders do
    # PATCH /folders/sort
    collection { patch :sort }
  end

  # ----- API 専用ルート -----
  namespace :api do
    resources :folders, only: [ :index, :show ]
  end

  # ヘルスチェック
  get "up", to: "rails/health#show", as: :rails_health_check

  # ルートパス（必要なら）
  # root "posts#index"
end
