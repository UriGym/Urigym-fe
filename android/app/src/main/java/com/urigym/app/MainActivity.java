package com.urigym.app;

import android.app.Dialog;
import android.os.Bundle;
import android.os.Message;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Kakao's login SDK opens its popup via window.open(), which a stock WebView
        // silently drops (no window ever appears, no error — the caller just hangs).
        // This is the standard Android hook to actually create that popup as its own
        // WebView shown in a dialog, and to close the dialog when the popup content
        // calls window.close() after login completes.
        Bridge bridge = getBridge();
        WebView webView = bridge.getWebView();
        webView.getSettings().setSupportMultipleWindows(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
        webView.setWebChromeClient(new PopupAwareWebChromeClient(bridge));
    }

    private static class PopupAwareWebChromeClient extends BridgeWebChromeClient {

        PopupAwareWebChromeClient(Bridge bridge) {
            super(bridge);
        }

        @Override
        public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
            WebView popupView = new WebView(view.getContext());
            popupView.getSettings().setJavaScriptEnabled(true);
            popupView.getSettings().setDomStorageEnabled(true);
            popupView.setWebViewClient(new WebViewClient());

            Dialog dialog = new Dialog(view.getContext());
            dialog.setContentView(popupView);
            dialog.setOnDismissListener(d -> popupView.destroy());

            popupView.setWebChromeClient(
                new WebChromeClient() {
                    @Override
                    public void onCloseWindow(WebView window) {
                        dialog.dismiss();
                    }
                }
            );

            WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
            transport.setWebView(popupView);
            resultMsg.sendToTarget();

            dialog.show();
            return true;
        }
    }
}
