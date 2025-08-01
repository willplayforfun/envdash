import React, { useState, useEffect } from 'react';

// Download states enum
export const DOWNLOAD_STATES = {
	INIT: 'init',
	NOTSTARTED: 'notstarted',
	DOWNLOADING: 'downloading', 
	SUCCESS: 'success',
	ERROR: 'error',
	OK: 'ok'
};

// Data Downloader Component with Tailwind and enum
function DataDownloader({ name, description, status, onDownload, files = [] }) {
	const getStatusColor = () => {
		switch(status?.state) {
			case DOWNLOAD_STATES.DOWNLOADING: return 'text-amber-500';
			case DOWNLOAD_STATES.SUCCESS: return 'text-emerald-500';
			case DOWNLOAD_STATES.ERROR: return 'text-red-500';
			case DOWNLOAD_STATES.NOTSTARTED:
			case DOWNLOAD_STATES.OK:
			case DOWNLOAD_STATES.INIT:
			default: return 'text-gray-500';
		}
	};

	const getStatusText = () => {
		switch(status?.state) {
			case DOWNLOAD_STATES.DOWNLOADING: return 'Downloading...';
			case DOWNLOAD_STATES.SUCCESS: return 'Downloaded';
			case DOWNLOAD_STATES.ERROR: return 'Error';
			case DOWNLOAD_STATES.NOTSTARTED: return 'Need to Download';
			case DOWNLOAD_STATES.OK: return 'Already Downloaded';
			case DOWNLOAD_STATES.INIT: return 'Waiting for server';
			default: return 'UNKNOWN STATUS: ${status?.state}';
		}
	};

	const getStatusBgColor = () => {
		switch(status?.state) {
			case DOWNLOAD_STATES.ERROR: return 'bg-red-50 border-red-200';
			default: return 'bg-blue-50 border-blue-200';
		}
	};

	const isInitializing = status?.state === DOWNLOAD_STATES.INIT;
	const isDownloading = status?.state === DOWNLOAD_STATES.DOWNLOADING;
	const isDownloaded = (status?.state === DOWNLOAD_STATES.SUCCESS) || (status?.state === DOWNLOAD_STATES.OK);
	const isDisabled = isInitializing || isDownloading || isDownloaded;

	const getButtonText = () => {
		if (isDownloading) {
			return 'Downloading...';
		}
		if (isDownloaded) {
			return 'Downloaded';
		}
		if (isInitializing) {
			return 'Waiting...'
		}
		return 'Download';
	};


	return (
		<div className="border border-gray-200 rounded-lg p-4 mb-4">
			<div className="flex justify-between items-center mb-2">
				<h3 className="m-0 text-lg font-semibold">{name}</h3>
				<div className="flex items-center gap-3">
					<span className={`text-sm font-medium ${getStatusColor()}`}>
						{getStatusText()}
					</span>
					<button
						onClick={(e) => {
							e.preventDefault();
							onDownload();
						}}
						disabled={isDisabled}
						className={`px-3 py-1.5 text-sm rounded transition-colors duration-200 ${
							isDisabled 
								? 'bg-gray-400 text-white cursor-not-allowed' 
								: 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
						}`}
					>
						{getButtonText()}
					</button>
				</div>
			</div>
			
			<p className="m-0 mb-3 text-gray-600 text-sm">
				{description}
			</p>
			
			{files.length > 0 && (
				<div className="text-xs text-gray-400">
					<strong>Files:</strong> {files.join(', ')}
				</div>
			)}
			
			{status?.message && (
				<div className={`mt-2 p-2 rounded text-xs border ${getStatusBgColor()}`}>
					{status.message}
				</div>
			)}
		</div>
	);
}

export default DataDownloader;