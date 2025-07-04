class FoldersController < ApplicationController
  before_action :set_folder, only: %i[show update destroy]

  # GET /folders
  # ルートフォルダだけ返し、子孫は JSON に含める
  def index
    roots = Folder.where(parent_id: nil).order(:position)
    render json: roots.map(&:as_tree_json)
  end

  # GET /folders/:id
  def show
    render json: @folder.as_tree_json
  end

  # POST /folders
  def create
    folder = Folder.new(folder_params)

    if folder.save
      render json: folder, status: :created
    else
      render json: folder.errors, status: :unprocessable_entity
    end
  end

  # PATCH /folders/:id
  def update
    if @folder.update(folder_params)
      render json: @folder
    else
      render json: @folder.errors, status: :unprocessable_entity
    end
  end

  # DELETE /folders/:id
  def destroy
    @folder.destroy!
    head :no_content
  end

  # PATCH /folders/sort
  # params[:order] => [3,1,2,...]
  def sort
    params.require(:order).each_with_index do |id, idx|
      Folder.where(id: id).update_all(position: idx)
    end
    head :ok
  end

  private

  def set_folder
    @folder = Folder.find(params[:id])
  end

  def folder_params
    params.require(:folder).permit(:name, :parent_id, :position)
  end
end
