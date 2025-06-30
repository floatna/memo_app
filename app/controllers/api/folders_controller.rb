class Api::FoldersController < ApplicationController
  def index
    top_folders = Folder.where(parent_id: nil).includes(:cards, :children)
    render json: top_folders.map(&:as_tree_json)
  end

  def show
    folder = Folder.find(params[:id])
    render json: folder.as_tree_json
  end
end
